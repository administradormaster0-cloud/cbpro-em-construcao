import "./shared-3e12d845ec.js";
import "./shared-7ad70ac95c.js";
import "./shared-6b92eaf278.js";
import "./shared-2320f7865b.js";
import "./shared-cdd99b42aa.js";
import "./shared-d02d47808a.js";
import "./shared-8296cb5d1a.js";
import {useSearchParams} from "./shared-3e12d845ec.js";
import {Card} from "./shared-7ad70ac95c.js";
import {CardHeader,CardTitle} from "./shared-6b92eaf278.js";
import {CardDescription} from "./shared-2320f7865b.js";
import {CardContent} from "./shared-cdd99b42aa.js";
import {Label$2} from "./shared-d02d47808a.js";
import {Input} from "./shared-8296cb5d1a.js";
const {useTranslation,useOrganizationSite,reactExports,useNavigate,supabase,ue$1,jsxRuntimeExports,LanguageSwitcher,organizationLogoUrl,Button$1,UserPlus,Link,Eye} = globalThis;
function Login({ initialForgot: i = !1 } = {}) { const { t: o } = useTranslation(), et = useOrganizationSite(), [st, at] = reactExports.useState(""), [vt, Ct] = reactExports.useState(""), [Tt, Lt] = reactExports.useState(!1), [$t, qt] = reactExports.useState(i), [Ht, Gt] = reactExports.useState(""), [Kt, tr] = reactExports.useState(!1), rr = useNavigate(), [nr] = useSearchParams(), jr = async (ir) => { ir.preventDefault(), Lt(!0); try {
    const { error: or } = await supabase.auth.signInWithPassword({ email: st, password: vt });
    if (or)
        throw or;
    const Lr = nr.get("redirect");
    rr(Lr != null && Lr.startsWith("/") ? Lr : et ? "/" : "/dashboard");
}
catch (or) {
    ue$1.error(or.message || o("login.error"));
}
finally {
    Lt(!1);
} }; const authTree=jsxRuntimeExports.jsxs("div", { className: `min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden ${et ? "organization-auth-page" : ""}`, children: [jsxRuntimeExports.jsx("div", { className: "absolute top-4 right-4 z-20", children: jsxRuntimeExports.jsx(LanguageSwitcher, {}) }), jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" }), jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md space-y-8 relative z-10", children: [jsxRuntimeExports.jsx("div", { className: "text-center space-y-2", children: et ? jsxRuntimeExports.jsxs("div", { className: "organization-auth-brand", children: [organizationLogoUrl(et.federation.logo_url) ? jsxRuntimeExports.jsx("img", { alt: "", src: organizationLogoUrl(et.federation.logo_url) }) : jsxRuntimeExports.jsx("span", { children: (et.federation.short_name || et.federation.name).slice(0, 2).toUpperCase() }), jsxRuntimeExports.jsx("strong", { children: et.federation.name }), jsxRuntimeExports.jsx("p", { children: o("organizationSite.auth.welcomeBack", "Bem-vindo de volta") })] }) : jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1", "aria-label": "FC CLUBS", children: [jsxRuntimeExports.jsxs("span", { className: "public-navbar-brand__name", children: [jsxRuntimeExports.jsx("span", { className: "font-display text-2xl font-black uppercase italic tracking-[0.04em] text-foreground", children: "FC" }), jsxRuntimeExports.jsx("span", { className: "font-display text-2xl font-black uppercase italic tracking-[0.04em] text-primary", children: "Clubs" })] }), jsxRuntimeExports.jsx("span", { className: "public-navbar-brand__subtitle", children: o("common.footballCommunity", "Football Community") })] }) }), jsxRuntimeExports.jsxs(Card, { className: "card-glow border-border/30", children: [jsxRuntimeExports.jsxs(CardHeader, { className: "space-y-1", children: [jsxRuntimeExports.jsx(CardTitle, { className: "text-xl font-display", children: o("login.title") }), jsxRuntimeExports.jsx(CardDescription, { children: o("login.subtitle") })] }), jsxRuntimeExports.jsxs(CardContent, { children: [jsxRuntimeExports.jsxs("form", { onSubmit: jr, className: "space-y-4", children: [jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [jsxRuntimeExports.jsx(Label$2, { htmlFor: "email", className: "text-xs uppercase tracking-wider text-muted-foreground", children: o("login.email") }), jsxRuntimeExports.jsx(Input, { id: "email", type: "email", value: st, onChange: ir => at(ir.target.value), placeholder: o("login.emailPlaceholder"), required: !0 })] }), jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [jsxRuntimeExports.jsx(Label$2, { htmlFor: "password", className: "text-xs uppercase tracking-wider text-muted-foreground", children: o("login.password") }), jsxRuntimeExports.jsx(Input, { id: "password", type: "password", value: vt, onChange: ir => Ct(ir.target.value), placeholder: o("login.passwordPlaceholder"), required: !0, minLength: 6 })] }), jsxRuntimeExports.jsx(Button$1, { type: "submit", className: "w-full", disabled: Tt, children: o(Tt ? "login.loading" : "login.submit") }), jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: jsxRuntimeExports.jsx("button", { type: "button", onClick: () => qt(!0), className: "text-xs text-primary hover:underline", children: o("organizationSite.auth.forgot", "Esqueceu a senha?") }) })] }), $t && jsxRuntimeExports.jsxs("div", { className: "mt-4 p-4 border border-border/30 rounded-lg space-y-3", children: [jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: o("organizationSite.auth.forgotCopy", "Digite seu e-mail para receber o link de recuperação:") }), jsxRuntimeExports.jsx(Input, { type: "email", value: Ht, onChange: ir => Gt(ir.target.value), placeholder: "seu@email.com" }), jsxRuntimeExports.jsx(Button$1, { className: "w-full", disabled: Kt, onClick: async () => { if (Ht) {
                                                tr(!0);
                                                try {
                                                    const { error: ir } = await supabase.auth.resetPasswordForEmail(Ht, { redirectTo: `${window.location.origin}/reset-password` });
                                                    if (ir)
                                                        throw ir;
                                                    ue$1.success("Link de recuperação enviado! Verifique seu e-mail."), qt(!1);
                                                }
                                                catch (ir) {
                                                    ue$1.error(ir.message || "Erro ao enviar link de recuperação.");
                                                }
                                                finally {
                                                    tr(!1);
                                                }
                                            } }, children: Kt ? o("organizationSite.auth.sending", "Enviando...") : o("organizationSite.auth.sendRecovery", "Enviar link de recuperação") })] }), jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [jsxRuntimeExports.jsxs("div", { className: "relative", children: [jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center", children: jsxRuntimeExports.jsx("span", { className: "w-full border-t border-border/30" }) }), jsxRuntimeExports.jsx("div", { className: "relative flex justify-center text-xs uppercase", children: jsxRuntimeExports.jsx("span", { className: "bg-card px-2 text-muted-foreground", children: "ou" }) })] }), jsxRuntimeExports.jsxs(Button$1, { variant: "outline", className: "w-full gap-2", onClick: () => rr(et ? "/register" : "/signup"), children: [jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4" }), o("organizationSite.auth.createAccount", "Criar nova conta")] }), jsxRuntimeExports.jsx(Link, { to: "/", className: "block", children: jsxRuntimeExports.jsxs(Button$1, { variant: "ghost", className: "w-full gap-2 text-muted-foreground", children: [jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }), et ? o("organizationSite.auth.backToSite", "Voltar ao site") : o("organizationSite.auth.guest", "Entrar como Visitante")] }) })] })] })] })] })] });const authPieces=authTree.props.children;const formPieces=authPieces[2].props.children;
return jsxRuntimeExports.jsxs('div',{className:'cbpro-auth',children:[jsxRuntimeExports.jsxs('aside',{className:'cbpro-auth-story',children:[jsxRuntimeExports.jsx(Link,{to:'/',children:jsxRuntimeExports.jsx('img',{src:'/assets/plates/brand.png',alt:'CBPRO',width:240,height:60})}),jsxRuntimeExports.jsx('h1',{children:'Seu próximo capítulo começa em campo.'}),jsxRuntimeExports.jsx('p',{children:'Clubes, jogadores e campeonatos em um só lugar.'}),jsxRuntimeExports.jsx(Link,{to:'/tournaments-public',children:'Explorar campeonatos'})]}),jsxRuntimeExports.jsxs('main',{className:'cbpro-auth-form',children:[authPieces[0],et?formPieces[0]:null,...formPieces.slice(1)]})]}); }
export default Login;
