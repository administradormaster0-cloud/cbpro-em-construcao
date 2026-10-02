// Preserve the supplied application's algorithms byte-for-byte.
// The HTTP server rewrites only the backend origin and public client key.
// The separate /manage UI uses the local competition generator; it must not
// replace AdminBrackets or other generators in the supplied application.
export function adaptOriginalFrontend(source){return source;}
