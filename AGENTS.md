This is the Oak.io mobile app: its own product, built with Expo and React Native. Screens, copy, and route names can differ from the website. It uses the same Supabase project, the same database, and the same Google login.

The website lives in `oak-io-front`. Read it and `oak-io-front/supabase/migrations` to learn tables, columns, and business rules. Do not copy its layout, sidebar, full-page modals, or URL paths.

## Auth

Login is Google only, through Supabase Auth. There is no email and password screen.

The website OAuth redirect does not work on the device. Use the native Google flow, then persist the Supabase session so it survives an app restart.

## Supabase

Same backend as the website. Every read and write uses the signed-in user and relies on row level security (`auth.uid() = user_id`).

Tables in use: `transactions`, `metas`, `dividas`, `ativos`, `patrimonio_historico`.

Transaction types stay `Ganho`, `Gasto`, and `Investimento`. Month balance is income minus expenses minus investments. Confirm column names in the migrations or the website before writing a query.

## Environment

Credentials are already in `.env`. The app reads only:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

`VITE_*` names belong to the website and are not inlined into the Expo bundle. Do not commit `.env` or print secret values.

## Design system

The UI follows a light fintech card style: a pale canvas, white rounded cards with a single soft shadow, and a purple gradient only on the dashboard hero. Primary actions are purple pills. The tab bar is a floating white pill; the active item is a purple rounded square with a white icon.

Use `src/design-system`: `Card`, `PrimaryButton`, `Pill`, `ActionTile`, `Field`, `Title`, `Subtitle`, and `SectionTitle`. Keep new screens on these tokens. Do not return to dark neumorphism or full-screen gradients.

## Stack

- Expo SDK 57, JavaScript
- React Navigation (native stack and bottom tabs). Do not migrate to Expo Router or `src/app/`
- NativeWind 4 with Tailwind CSS 3. Install Tailwind classes only through NativeWind
- UI no estilo shadcn via React Native Reusables em `src/components/ui` (`npx @react-native-reusables/cli add <component>`). Preferir esses componentes em telas novas; o design-system legado ainda existe nas demais telas
- Icons from `lucide-react-native`
- App icon: `public/logo_app.png`
- Install native packages with `npx expo install`, not a bare `npm install`
- Do not create or edit `ios/` or `android/` by hand. Configure native behavior in `app.json` and config plugins

## Expo has changed — do not trust your training data

Before writing code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt and follow its links. Never answer from memory.

## Commands

```bash
npx expo install <package>
npx expo start
npx expo-doctor
npx expo install --fix
```

Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios` or `npx expo run:android`, or `eas build --profile development`.
