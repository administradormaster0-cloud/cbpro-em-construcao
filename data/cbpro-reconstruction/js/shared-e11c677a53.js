
const {reactExports,AiCreditsContext} = globalThis;
function useAiCredits(){const i=reactExports.useContext(AiCreditsContext);if(!i)throw new Error("useAiCredits must be used within AiCreditsProvider");return i}
export {useAiCredits};
