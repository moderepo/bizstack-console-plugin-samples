// Modify bizstack-console-sdk/dist/index.js.
//
// When the standard bizstack-console-sdk runs on a self-hosted server,
// the router does not work correctly, and RouteParams cannot be retrieved.
// As a result, helpers such as useGetParamValueFromRouteParamsAsNumber always return undefined.
//
// The root cause is that the RouteContext is created inside bizstack-console-sdk, so we cannot solve it externally.
// To work around this, replace the implementation of useParams defined inside bizstack-console-sdk.
// In the non-minified bizstack-console-sdk, useParams is defined as shown below, so rewrite it to use react-router-dom's useParams.
// However, the actual dist/index.js is minified, so you must identify the minified name of useParams to make this change.
//
// Original bizstack-console-sdk/dist/index.js:
// ```
// function useParams() {
//   let {
//     matches
//   } = React$1.useContext(RouteContext);
//   let routeMatch = matches[matches.length - 1];
//   return routeMatch ? routeMatch.params : {};
// }
// ```
//
// Modified bizstack-console-sdk/dist/index.js:
// ```
// import { useParams as __rrUseParams } from "react-router-dom";
// function useParams() {
//   return __rrUseParams();
// }
// ```

export const bizstackConsoleSDKTransform = (code: string, id: string) => {
    if (!id.includes('/node_modules/@moderepo/bizstack-console-sdk/dist/index.js')) {
        return null;
    }

    //
    // Replace useParams to use react-router-dom useParams.
    //

    // useParams isn't exported in bizstack-console-sdk/dist/index.js.
    // So we obtain its minified name from other exports, useParamsWrapper.
    //
    // Original useParamsWrapper:
    // ```
    // export const useParamsWrapper = () => {
    //    const routeParams = useParams();
    //    const [currentRouteParams, setCurrentRouteParams] = useState<Readonly<Params<string>>>(routeParams);
    // ```
    //
    // Minified code:
    // ```
    // const Iut = () => {
    //  const n = Mo(), [e, o] = p2(n);
    // ```

    const useParamsWrapperMatch = code.match(/\b([\w$]+)\s+as useParamsWrapper,/);
    if (useParamsWrapperMatch) {
        const useParamsWrapperName = useParamsWrapperMatch[1]; // e.g., "Iut"
        console.log({ useParamsWrapperName });

        const re = new RegExp(`const ${useParamsWrapperName} .+?{.*?const .+?=(.+?)\\(`, 's');
        const useParamsMatch = code.match(re);
        if (useParamsMatch) {
            const useParamsName = useParamsMatch[1].trim(); // e.g., "Mo"
            console.log({ useParamsName });

            // Use useParams of react-router-dom.
            code = `import { useParams as __rrUseParams } from "react-router-dom";\n` + code;

            // The original code creates its own context and returns it as params.
            // Since that context can't be modified from outside the SDK,
            // we need to replace with react-router-dom's useParams.
            //
            // Original useParams code (minified):
            // ```
            // function Mo() {
            //   let {
            //     matches: n
            //   } = I.useContext(yo), e = n[n.length - 1];
            //   return e ? e.params : {};
            // }
            // ```
            //
            // Modified code:
            // ```
            // function Mo() {
            //   return __rrUseParams();
            // }
            // ```

            const pattern = new RegExp(`^function ${useParamsName}\(\).+?^}`, 'ms');
            code = code.replace(
                pattern,
                `
function ${useParamsName}() {
  return __rrUseParams();
}
`
            );

            return { code, map: null };
        }
    }

    throw new Error('The bizstack-console-sdk/dist/index.js did not contain the expected content. Please update modify-sdk.ts');
};
