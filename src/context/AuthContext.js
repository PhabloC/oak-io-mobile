import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../lib/supabase";

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

const isExpoGo = Constants.appOwnership === "expo";

/**
 * Expo Go ignora o scheme oakio e usa exp://IP:porta/--/path.
 * O GoTrue do Supabase rejeita redirect com IP privado e cai no Site URL (localhost:5173).
 * Por isso, no Expo Go pedimos tunnel (exp://*.expo.dev / *.exp.direct).
 */
function resolveRedirectTo() {
  if (Platform.OS === "web") {
    return typeof window !== "undefined" ? window.location.origin : "";
  }

  if (isExpoGo) {
    return makeRedirectUri({ path: "google-auth" });
  }

  return makeRedirectUri({
    scheme: "oakio",
    path: "google-auth",
  });
}

function redirectHasPrivateIp(url) {
  return /exp:\/\/(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?/i.test(url || "");
}

function mapUser(sessionUser) {
  if (!sessionUser) return null;
  const meta = sessionUser.user_metadata || {};
  return {
    id: sessionUser.id,
    email: sessionUser.email || "",
    name: meta.full_name || meta.name || sessionUser.email || "Usuário",
    avatar: meta.avatar_url || meta.picture || "",
  };
}

async function createSessionFromUrl(url) {
  if (!url) return false;

  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) {
    throw new Error(String(errorCode));
  }

  const errorDescription = params.error_description || params.error;
  if (errorDescription) {
    throw new Error(decodeURIComponent(String(errorDescription).replace(/\+/g, " ")));
  }

  const { access_token, refresh_token, code } = params;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(String(code));
    if (error) throw error;
    return true;
  }

  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token: String(access_token),
      refresh_token: String(refresh_token),
    });
    if (error) throw error;
    return true;
  }

  return false;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const redirectTo = resolveRedirectTo();

  useEffect(() => {
    let mounted = true;

    const applyUrl = (url) => {
      createSessionFromUrl(url).catch((error) => {
        if (mounted && (String(url).includes("access_token") || String(url).includes("code") || String(url).includes("error"))) {
          console.warn("Login Google:", error?.message || error);
        }
      });
    };

    if (Platform.OS === "web") {
      applyUrl(window.location.href);
    } else {
      Linking.getInitialURL().then((url) => {
        if (url) applyUrl(url);
      });
    }

    const linking = Linking.addEventListener("url", ({ url }) => applyUrl(url));

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(mapUser(data.session?.user));
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session?.user));
      setLoading(false);
    });

    return () => {
      mounted = false;
      linking.remove();
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async () => {
    const queryParams = { access_type: "offline", prompt: "consent" };

    if (Platform.OS !== "web" && redirectHasPrivateIp(redirectTo)) {
      throw new Error(
        "No Expo Go o Supabase bloqueia redirect com IP (ex.: 192.168.x.x) e manda para localhost:5173. Pare o Metro e rode: npm run start:tunnel — depois escaneie o QR de novo. No Supabase, em Redirect URLs, deixe exp://** e oakio://**."
      );
    }

    if (Platform.OS === "web") {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, queryParams },
      });
      if (error) throw error;
      return;
    }

    if (__DEV__) {
      console.log("OAuth redirectTo:", redirectTo);
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams,
      },
    });
    if (error) throw error;
    if (!data?.url) throw new Error("Não foi possível abrir o login.");

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === "success") {
      await createSessionFromUrl(result.url);
      return;
    }

    if (result.type === "dismiss") {
      throw new Error(
        "Login incompleto. Use npm run start:tunnel no Expo Go e confira Redirect URLs no Supabase: exp://** e oakio://**."
      );
    }
  };

  const signOut = () => supabase.auth.signOut();

  const updateProfile = (name) => {
    setUser((current) => (current ? { ...current, name } : current));
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, updateProfile, redirectTo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
