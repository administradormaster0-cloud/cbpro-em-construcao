function TournamentPublic({ overrideId: i } = {}) {
    var B0, X0, _1, z1, X1, k1, H1, U1;
    const { id: o } = useParams(), et = i || o, st = useOrganizationSite(), { t: at, i18n: vt } = useTranslation();
    useNavigate();
    const { user: Ct } = useAuth(), { plan: Tt } = useSubscription(), Lt = getCalendarTier(Tt), [$t, qt] = reactExports.useState(null), [Ht, Gt] = reactExports.useState([]), [Kt, tr] = reactExports.useState([]), [rr, nr] = reactExports.useState([]), [jr, ir] = reactExports.useState([]), [or, Lr] = reactExports.useState(null), [Ir, qr] = reactExports.useState(!0), [Hr, Yr] = reactExports.useState({}), [Kr, Zr] = reactExports.useState(!1), [Xr, _n] = reactExports.useState(!1), [Mo, In] = reactExports.useState([]), [Uo, No] = reactExports.useState(0), [ko, vn] = reactExports.useState(!1), [Tn, Ro] = reactExports.useState(!1), [Bo, wn] = reactExports.useState([]), [Sn, Go] = reactExports.useState(""), [An, Xo] = reactExports.useState([]), [ax, ox] = reactExports.useState(""), [Qo, ex] = reactExports.useState(null), [tx, rx] = reactExports.useState(null), [xx, mx] = reactExports.useState(!1), [yx, hx] = reactExports.useState(null), [dx, jx] = reactExports.useState(null), [Ex, Px] = reactExports.useState(null), [Zx, Dx] = reactExports.useState(null), [i0, Bx] = reactExports.useState(!1), [Hx, Sx] = reactExports.useState(!1), qx = usePixCheckout({ onPixGenerated: k0 => { Px(k0), mx(!1), hx(null); }, onError: k0 => { ue$1.error("Erro ao gerar PIX: " + k0), hx(null); } }), [wx, Ax] = reactExports.useState(null), [Gx, n0] = reactExports.useState(null), [Jx, m0] = reactExports.useState(void 0), { templateSlug: Xx, loading: Ox } = useOrgTemplate(Jx);
    reactExports.useEffect(() => { supabase.from("site_settings").select("value").eq("key", "tournament_bg_design").maybeSingle().then(({ data: k0 }) => { if (k0 != null && k0.value)
        try {
            const s1 = typeof k0.value == "string" ? JSON.parse(k0.value) : k0.value;
            ex(s1);
        }
        catch { } }); }, []), reactExports.useEffect(() => { if (!et)
        return; (async () => { var H0; const [s1, n1, d0, C0] = await Promise.all([supabase.from("tournaments").select("*, games(name, participant_type, logo_object_key), countries(name)").eq("id", et).single(), supabase.from("tournament_stages").select("*, stage_groups(*, group_entrants(entrant_id))").eq("tournament_id", et).order("stage_order"), supabase.from("entrants").select("*, player_profiles(id, handle, photo_object_key, user_id), teams(id, name, tag, emblem_object_key), easy_custom_teams(id, name, logo_object_key), registrations(id, status)").eq("tournament_id", et), supabase.from("ranked_seasons").select("id, name, starts_at, ends_at, game_id, source").eq("source", "tournament").order("starts_at", { ascending: !1 })]), h1 = s1.data; if (h1 && h1.status === "DRAFT") {
        qt(null), qr(!1);
        return;
    } if (qt(h1), rx(h1 ? resolveTournamentSeason(h1, C0.data || []) : null), Gt(n1.data || []), tr(d0.data || []), h1 != null && h1.federation_id) {
        const [T1, M1] = await Promise.all([supabase.from("federations").select("*, countries:country_id(name, iso2)").eq("id", h1.federation_id).maybeSingle(), supabase.from("federation_customizations").select("*").eq("federation_id", h1.federation_id).maybeSingle()]);
        n0(T1.data), Ax(M1.data), m0(h1.federation_id);
    } if (h1 != null && h1.champion_entrant_id) {
        const T1 = (d0.data || []).find(M1 => M1.id === h1.champion_entrant_id);
        Lr(T1);
    } if (Ct && h1) {
        const { data: T1 } = await supabase.from("player_profiles").select("id").eq("user_id", Ct.id), { data: M1 } = await supabase.from("teams").select("id").eq("owner_user_id", Ct.id), ny = [];
        let L1 = null;
        if (T1 && T1.length > 0) {
            const T0 = T1.map(_0 => _0.id), c1 = (d0.data || []).some(_0 => { var b0; return T0.includes(_0.player_profile_id) && ((b0 = _0.registrations) == null ? void 0 : b0.some(u1 => ["PENDING", "APPROVED"].includes(u1.status))); });
            _n(c1), (d0.data || []).forEach(_0 => { if (T0.includes(_0.player_profile_id)) {
                ny.push(_0.id);
                const b0 = (_0.registrations || []).find(u1 => u1.status === "PENDING");
                b0 && !L1 && (L1 = { registrationId: b0.id, entrantId: _0.id });
            } });
        }
        if (M1 && M1.length > 0) {
            const T0 = M1.map(b0 => b0.id), c1 = (d0.data || []).filter(b0 => { var u1; return T0.includes(b0.team_id) && ((u1 = b0.registrations) == null ? void 0 : u1.some(v1 => ["PENDING", "APPROVED"].includes(v1.status))); }), _0 = h1 == null ? void 0 : h1.max_teams_per_user;
            (_0 && c1.length >= _0 || c1.length > 0 && ((H0 = h1 == null ? void 0 : h1.games) == null ? void 0 : H0.participant_type) !== "TEAM") && _n(!0), (d0.data || []).forEach(b0 => { if (T0.includes(b0.team_id)) {
                ny.push(b0.id);
                const u1 = (b0.registrations || []).find(v1 => v1.status === "PENDING");
                u1 && !L1 && (L1 = { registrationId: u1.id, entrantId: b0.id });
            } });
        }
        In(ny), Dx(L1);
    } if (n1.data && n1.data.length > 0) {
        const T1 = n1.data.map(u1 => u1.id), [M1, ny] = await Promise.all([supabase.from("match_series").select("*, entrant_a:entrants!match_series_entrant_a_id_fkey(id, player_profiles(handle), teams(name, tag), easy_custom_teams(id, name)), entrant_b:entrants!match_series_entrant_b_id_fkey(id, player_profiles(handle), teams(name, tag), easy_custom_teams(id, name)), series_games(*), bracket_round:bracket_rounds!match_series_bracket_round_id_fkey(id, name, round_number)").in("stage_id", T1).order("created_at"), supabase.from("stage_standings").select("*, entrants(id, player_profiles(handle, photo_object_key), teams(id, name, tag, emblem_object_key), easy_custom_teams(id, name))").in("stage_id", T1).order("position")]);
        nr(M1.data || []), ir(ny.data || []);
        const L1 = ny.data || [], T0 = d0.data || [], c1 = [...L1.map(u1 => { var v1, I1; return (I1 = (v1 = u1.entrants) == null ? void 0 : v1.teams) == null ? void 0 : I1.id; }), ...T0.map(u1 => { var v1; return (v1 = u1.teams) == null ? void 0 : v1.id; })].filter(Boolean), _0 = [...L1.map(u1 => u1.entrant_id), ...T0.map(u1 => { var v1; return ((v1 = u1.player_profiles) == null ? void 0 : v1.user_id) || u1.player_profile_id; })].filter(Boolean), b0 = [...new Set([...c1, ..._0])];
        if (b0.length > 0) {
            const { data: u1 } = await supabase.from("subscriptions").select("entity_id, plans(tier)").in("entity_id", b0).eq("status", "active"), v1 = {};
            (u1 || []).forEach(I1 => { var J1; (J1 = I1.plans) != null && J1.tier && (v1[I1.entity_id] = I1.plans.tier); }), Yr(v1);
        }
    } qr(!1); })(); }, [et, Ct, Uo]), reactExports.useEffect(() => { if (!et || !Ht || Ht.length === 0)
        return; const k0 = Ht.map(n1 => n1.id), s1 = supabase.channel(`tournament-standings-${et}`).on("postgres_changes", { event: "*", schema: "public", table: "stage_standings" }, n1 => { var d0, C0; (k0.includes((d0 = n1.new) == null ? void 0 : d0.stage_id) || k0.includes((C0 = n1.old) == null ? void 0 : C0.stage_id)) && No(h1 => h1 + 1); }).subscribe(); return () => { supabase.removeChannel(s1); }; }, [et, Ht]);
    const Qx = k0 => { var s1, n1; return k0 ? (s1 = k0.easy_custom_teams) != null && s1.name ? k0.easy_custom_teams.name : (n1 = k0.player_profiles) != null && n1.handle ? k0.player_profiles.handle : k0.teams ? (k0.teams.tag ? `[${k0.teams.tag}] ` : "") + (k0.teams.name || "") : "—" : "—"; }, h0 = (Ct == null ? void 0 : Ct.id) === ($t == null ? void 0 : $t.created_by_user_id), o0 = $t == null ? void 0 : $t.is_easy_mode, fx = () => No(k0 => k0 + 1), lx = k0 => k0 === "REG_OPEN" ? at("tournamentPublic.regOpen") : k0 === "RUNNING" ? at("tournamentPublic.running") : k0 === "FINISHED" ? at("tournamentPublic.finished") : k0 === "PUBLISHED" ? at("tournamentPublic.published") : k0;
    reactExports.useEffect(() => { const k0 = new URLSearchParams(window.location.search), s1 = k0.get("payment"), n1 = k0.get("registration"); s1 === "success" && n1 ? (async () => { try {
        const { data: C0, error: h1 } = await supabase.functions.invoke("verify-registration-payment", { body: { registrationId: n1 } });
        if (h1)
            throw h1;
        (C0 == null ? void 0 : C0.status) === "paid" ? (ue$1.success(at("tournamentPublic.paymentConfirmed")), _n(!0), No(H0 => H0 + 1)) : ue$1.info(at("tournamentPublic.paymentProcessing"));
    }
    catch (C0) {
        ue$1.error(`${at("tournamentPublic.paymentVerificationError")}: ${C0.message}`);
    } window.history.replaceState({}, "", window.location.pathname); })() : s1 === "canceled" && (ue$1.info(at("tournamentPublic.paymentCanceled")), window.history.replaceState({}, "", window.location.pathname)); }, []);
    const _x = async () => { var s1; if (!Ct || !$t)
        return; if (((s1 = $t.games) == null ? void 0 : s1.participant_type) === "SOLO") {
        const { data: n1 } = await supabase.from("player_profiles").select("id, handle, tier_id").eq("user_id", Ct.id).eq("game_id", $t.game_id);
        if (!n1 || n1.length === 0) {
            ue$1.error(at("tournamentPublic.noPlayerProfile"));
            return;
        }
        const { data: d0 } = await supabase.from("tournament_allowed_tiers").select("tier_id").eq("tournament_id", $t.id);
        let C0 = n1;
        if (d0 && d0.length > 0) {
            const h1 = d0.map(H0 => H0.tier_id);
            C0 = n1.filter(H0 => H0.tier_id && h1.includes(H0.tier_id));
        }
        if (C0.length === 0) {
            ue$1.error(at("tournamentPublic.noEligibleProfile"));
            return;
        }
        C0.length === 1 ? Vx(C0[0].id, null) : (Xo(C0), ox(C0[0].id), Ro(!0));
    }
    else {
        const { data: n1 } = await supabase.from("teams").select("id, name, tag, tier_id, country_id, emblem_object_key").eq("owner_user_id", Ct.id).eq("game_id", $t.game_id), { data: d0 } = await supabase.from("team_managers").select("team_id").eq("user_id", Ct.id).eq("status", "ACCEPTED"), C0 = (d0 || []).map(T0 => T0.team_id);
        let h1 = [];
        if (C0.length > 0) {
            const { data: T0 } = await supabase.from("teams").select("id, name, tag, tier_id, country_id, emblem_object_key").in("id", C0).eq("game_id", $t.game_id);
            h1 = T0 || [];
        }
        const H0 = new Map;
        for (const T0 of [...n1 || [], ...h1])
            H0.has(T0.id) || H0.set(T0.id, T0);
        const T1 = Array.from(H0.values());
        if (T1.length === 0) {
            ue$1.error("Você precisa ser dono ou manager de um time para este game.");
            return;
        }
        let M1 = T1;
        if ($t.scope === "FEDERATION" && $t.federation_id) {
            const { data: T0 } = await supabase.from("federation_countries").select("country_id").eq("federation_id", $t.federation_id);
            if (T0 && T0.length > 0) {
                const c1 = T0.map(_0 => _0.country_id);
                M1 = M1.filter(_0 => c1.includes(_0.country_id));
            }
        }
        else
            $t.scope === "COUNTRY" && $t.country_id && (M1 = M1.filter(T0 => T0.country_id === $t.country_id));
        const { data: ny } = await supabase.from("tournament_allowed_tiers").select("tier_id").eq("tournament_id", $t.id);
        if (ny && ny.length > 0) {
            const T0 = ny.map(c1 => c1.tier_id);
            M1 = M1.filter(c1 => c1.tier_id && T0.includes(c1.tier_id));
        }
        const L1 = Kt.filter(T0 => { var c1; return T0.team_id && ((c1 = T0.registrations) == null ? void 0 : c1.some(_0 => ["PENDING", "APPROVED", "WAITLIST"].includes(_0.status))); }).map(T0 => T0.team_id);
        if (M1 = M1.filter(T0 => !L1.includes(T0.id)), M1.length === 0) {
            ue$1.error(at("tournamentPublic.noEligibleTeam"));
            return;
        }
        M1.length === 1 ? Vx(null, M1[0].id) : (wn(M1), Go(M1[0].id), Ro(!0));
    } }, Vx = async (k0, s1) => { if (!(!Ct || !$t)) {
        Zr(!0), Ro(!1);
        try {
            const n1 = !$t.is_free && $t.entry_fee && $t.entry_fee > 0, d0 = $t.max_registrations;
            let C0 = !1;
            if (d0 && d0 > 0) {
                const { count: T0 } = await supabase.from("registrations").select("id", { count: "exact", head: !0 }).eq("tournament_id", $t.id).in("status", ["APPROVED", "PENDING"]);
                (T0 || 0) >= d0 && (C0 = !0);
            }
            const h1 = { tournament_id: $t.id };
            k0 && (h1.player_profile_id = k0), s1 && (h1.team_id = s1);
            const { data: H0, error: T1 } = await supabase.from("entrants").insert(h1).select().single();
            if (T1)
                throw T1;
            const M1 = H0.id;
            if (C0) {
                const { error: T0 } = await supabase.from("registrations").insert({ tournament_id: $t.id, entrant_id: M1, status: "WAITLIST" });
                if (T0)
                    throw T0;
                ue$1.success("Vagas esgotadas! Você entrou na fila de espera."), _n(!0), Zr(!1), No(c1 => c1 + 1);
                return;
            }
            const { data: ny, error: L1 } = await supabase.from("registrations").insert({ tournament_id: $t.id, entrant_id: M1, status: "PENDING" }).select().single();
            if (L1)
                throw L1;
            if (n1) {
                const { data: T0 } = await supabase.from("federations").select("is_platform").eq("id", $t.federation_id).single(), c1 = (T0 == null ? void 0 : T0.is_platform) === !0;
                let _0 = !1;
                if (c1)
                    _0 = !0;
                else {
                    const { data: b0 } = await supabase.from("federation_stripe_config").select("stripe_charges_enabled, stripe_account_id").eq("federation_id", $t.federation_id).maybeSingle();
                    _0 = !!(b0 != null && b0.stripe_charges_enabled && (b0 != null && b0.stripe_account_id));
                }
                if (_0)
                    if (c1) {
                        jx({ registrationId: ny.id, tournamentId: $t.id, fee: $t.entry_fee }), mx(!0), Zr(!1);
                        return;
                    }
                    else {
                        const { data: b0, error: u1 } = await supabase.functions.invoke("create-registration-checkout", { body: { registrationId: ny.id, tournamentId: $t.id } });
                        if (u1)
                            throw u1;
                        if (b0 != null && b0.url) {
                            window.location.href = b0.url;
                            return;
                        }
                        else
                            throw b0 != null && b0.error ? new Error(b0.error) : new Error("Erro ao criar sessão de pagamento");
                    }
                else
                    ue$1.success(at("tournamentPublic.registrationPaymentPending")), No(b0 => b0 + 1);
            }
            else
                ue$1.success(at("tournamentPublic.registrationPendingApproval")), No(T0 => T0 + 1);
        }
        catch (n1) {
            ue$1.error(n1.message);
        }
        finally {
            Zr(!1);
        }
    } }, s0 = async () => { if (dx) {
        hx("stripe");
        try {
            const { data: k0, error: s1 } = await supabase.functions.invoke("create-registration-checkout", { body: { registrationId: dx.registrationId, tournamentId: dx.tournamentId } });
            if (s1)
                throw s1;
            if (k0 != null && k0.url)
                window.location.href = k0.url;
            else if (k0 != null && k0.error)
                throw new Error(k0.error);
        }
        catch (k0) {
            ue$1.error(k0.message);
        }
        finally {
            hx(null);
        }
    } }, v0 = () => { dx && (hx("pix"), qx.requestPix({ paymentType: "registration", registrationId: dx.registrationId, tournamentId: dx.tournamentId })); }, Fx = async () => { if (Zx) {
        Bx(!0);
        try {
            const { data: k0, error: s1 } = await supabase.functions.invoke("cancel-registration", { body: { registrationId: Zx.registrationId } });
            if (s1)
                throw s1;
            if (k0 != null && k0.error)
                throw new Error(k0.error);
            ue$1.success(at("tournamentPublic.registrationCanceled")), _n(!1), Dx(null), No(n1 => n1 + 1);
        }
        catch (k0) {
            ue$1.error("Erro ao cancelar: " + k0.message);
        }
        finally {
            Bx(!1);
        }
    } }, g0 = async () => { if (!(!Zx || !$t)) {
        Sx(!0);
        try {
            const { data: k0 } = await supabase.from("federations").select("is_platform").eq("id", $t.federation_id).single();
            if ((k0 == null ? void 0 : k0.is_platform) === !0)
                jx({ registrationId: Zx.registrationId, tournamentId: $t.id, fee: $t.entry_fee }), mx(!0);
            else {
                const { data: n1 } = await supabase.from("federation_stripe_config").select("stripe_charges_enabled, stripe_account_id").eq("federation_id", $t.federation_id).maybeSingle();
                if (n1 != null && n1.stripe_charges_enabled && (n1 != null && n1.stripe_account_id)) {
                    const { data: d0, error: C0 } = await supabase.functions.invoke("create-registration-checkout", { body: { registrationId: Zx.registrationId, tournamentId: $t.id } });
                    if (C0)
                        throw C0;
                    if (d0 != null && d0.url) {
                        window.location.href = d0.url;
                        return;
                    }
                    else if (d0 != null && d0.error)
                        throw new Error(d0.error);
                }
                else
                    ue$1.info("Sua inscrição está aguardando aprovação do administrador.");
            }
        }
        catch (k0) {
            ue$1.error("Erro ao gerar pagamento: " + k0.message);
        }
        finally {
            Sx(!1);
        }
    } }, f0 = !($t != null && $t.is_free) && ($t == null ? void 0 : $t.entry_fee) > 0, a0 = Xr && Zx && ($t == null ? void 0 : $t.status) === "REG_OPEN", E0 = !($t != null && $t.max_registrations) || $t.max_registrations <= 0 ? !1 : Kt.filter(s1 => { var n1; return (n1 = s1.registrations) == null ? void 0 : n1.some(d0 => d0.status === "APPROVED" || d0.status === "PENDING"); }).length >= $t.max_registrations;
    if (Ir || Ox)
        return jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [!st && jsxRuntimeExports.jsx(PublicNavbar, {}), jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto p-6 pt-20 space-y-4", children: [jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-64" }), jsxRuntimeExports.jsx(Skeleton, { className: "h-48 w-full rounded-xl" })] })] });
    if (!$t)
        return jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [!st && jsxRuntimeExports.jsx(PublicNavbar, {}), jsxRuntimeExports.jsx("div", { className: "text-center py-20 text-muted-foreground pt-24", children: jsxRuntimeExports.jsx("p", { className: "text-lg", children: at("tournamentPublic.notFound") }) })] });
    const D0 = o0 ? Kt.filter(k0 => { var s1; return k0.easy_custom_team_id || ((s1 = k0.registrations) == null ? void 0 : s1.some(n1 => n1.status === "APPROVED")); }) : Kt.filter(k0 => { var s1; return (s1 = k0.registrations) == null ? void 0 : s1.some(n1 => n1.status === "APPROVED"); }), V0 = Kt.filter(k0 => { var s1; return k0.easy_custom_team_id || ((s1 = k0.registrations) == null ? void 0 : s1.length) > 0; }), p0 = (k0, s1, n1) => { const d0 = Kt.find(C0 => C0.id === k0); return { id: `placeholder-${s1}-${n1 ?? "null"}-${k0}`, entrant_id: k0, stage_id: s1, group_id: n1, position: 0, played: 0, wins: 0, draws: 0, losses: 0, score_for: 0, score_against: 0, score_diff: 0, points: 0, entrants: d0 ? { id: d0.id, player_profiles: d0.player_profiles, teams: d0.teams, easy_custom_teams: d0.easy_custom_teams } : null }; }, Q0 = (k0, s1) => (k0.group_entrants || []).map(d0 => d0.entrant_id).filter(Boolean).map(d0 => p0(d0, s1, k0.id)).filter(d0 => d0.entrants), K0 = k0 => D0.map(s1 => p0(s1.id, k0, null)).filter(s1 => s1.entrants), y1 = k0 => { const s1 = k0 ? jr.filter(d0 => d0.stage_id === k0) : jr; if (s1.length === 0)
        return k0 ? K0(k0) : []; const n1 = new Set; return s1.filter(d0 => { const C0 = d0.entrant_id || d0.id; return n1.has(C0) ? !1 : (n1.add(C0), !0); }); }, Tx = k0 => { if (k0.easy_custom_team_id)
        return { label: at("tournamentPublic.confirmed"), color: "hsl(142 71% 45%)" }; const s1 = (k0.registrations || []).map(n1 => n1.status); return s1.includes("APPROVED") ? { label: at("tournamentPublic.confirmed"), color: "hsl(142 71% 45%)" } : s1.includes("PENDING") ? { label: at("tournamentPublic.pending"), color: "hsl(45 93% 47%)" } : s1.includes("WAITLIST") ? { label: at("tournamentPublic.waitlist"), color: "hsl(220 14% 56%)" } : s1.includes("CANCELED") ? { label: at("tournamentPublic.canceled"), color: "hsl(0 84% 60%)" } : s1.includes("REJECTED") ? { label: at("tournamentPublic.rejected"), color: "hsl(0 84% 60%)" } : { label: at("tournamentPublic.pending"), color: "hsl(45 93% 47%)" }; }, Rx = $t.rules_overrides_json, Ix = Rx ? Rx.advance_per_group != null && Rx.num_groups != null ? Rx.advance_per_group * Rx.num_groups : Rx.league_top_n || null : null, Mx = ((B0 = st == null ? void 0 : st.customization) == null ? void 0 : B0.primary_color) || "#25E146", Wx = ((X0 = st == null ? void 0 : st.customization) == null ? void 0 : X0.secondary_color) || "#050809", $x = ((_1 = st == null ? void 0 : st.customization) == null ? void 0 : _1.accent_color) || "#F8F8F8", x0 = Gx != null && Gx.logo_url ? organizationLogoUrl(Gx.logo_url) : null, N0 = $t.logo_object_key ? `${supabaseUrl$u}/storage/v1/object/public/tournament-logos/${$t.logo_object_key}` : null, Kx = $t.trophy_image_object_key ? `${supabaseUrl$u}/storage/v1/object/public/trophy-images/${$t.trophy_image_object_key}` : null, e0 = [...Ht].sort((k0, s1) => k0.stage_order - s1.stage_order), u0 = k0 => k0 === "GROUPS" ? at("tournamentPublic.groups") : k0 === "PLAYOFFS" ? at("tournamentPublic.playoffs") : k0 === "LEAGUE" ? at("tournamentPublic.league") : k0, A0 = e0.map(k0 => `${u0(k0.stage_type)} MD${k0.best_of_default}`).join(" + "), I0 = rr.filter(k0 => k0.status === "FINISHED").length, F0 = rr.filter(k0 => k0.status !== "FINISHED" && k0.status !== "BYE").length;
    const eventTree=jsxRuntimeExports.jsxs("div", { className: "min-h-screen overflow-x-hidden relative bg-background text-foreground", children: [N0 && jsxRuntimeExports.jsx(TournamentWatermark, { logoUrl: N0, opacity: $t.watermark_opacity ?? .06, scale: $t.watermark_scale ?? 60 }), !st && jsxRuntimeExports.jsx(PublicNavbar, {}), !st && jsxRuntimeExports.jsx(PublicBottomNav, {}), jsxRuntimeExports.jsx("section", { className: "relative pt-14 border-b border-border", children: jsxRuntimeExports.jsxs("div", { className: "relative py-5 sm:py-7 px-4 sm:px-6", children: [jsxRuntimeExports.jsx("div", { className: "absolute inset-0", style: { background: `linear-gradient(160deg, ${Mx}0E, ${Wx} 45%, ${Wx})` } }), jsxRuntimeExports.jsx("div", { className: "relative max-w-7xl mx-auto", children: jsxRuntimeExports.jsxs(motion.div, { initial: false, animate: "visible", variants: stagger$1, children: [jsxRuntimeExports.jsx(motion.div, { variants: fadeUp$l, custom: 0, className: "flex justify-start mb-2", children: jsxRuntimeExports.jsx(Link, { to: st ? "/campeonatos" : Gx ? `/org/${Gx.id}` : "/tournaments-public", children: jsxRuntimeExports.jsxs(Button$1, { variant: "ghost", size: "sm", className: "gap-1.5 text-xs", style: { color: `${$x}88` }, children: [jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3.5 w-3.5" }), Gx ? Gx.name : "Torneios"] }) }) }), jsxRuntimeExports.jsxs(motion.div, { variants: fadeUp$l, custom: 1, className: "flex items-center gap-3 sm:gap-4 mb-3", children: [jsxRuntimeExports.jsx("div", { className: "shrink-0 h-20 w-20 sm:h-24 sm:w-24 rounded-none flex items-center justify-center overflow-hidden relative border border-border bg-card", children: N0 ? jsxRuntimeExports.jsx("img", { src: N0, alt: "", className: "h-full w-full object-contain p-2.5" }) : x0 ? jsxRuntimeExports.jsx("img", { src: x0, alt: "", className: "h-full w-full object-contain p-3 opacity-60" }) : jsxRuntimeExports.jsx(Trophy, { className: "h-10 w-10 opacity-30", style: { color: Mx } }) }), jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5 mb-1", children: [jsxRuntimeExports.jsx(Badge, { className: "rounded-none text-[10px] tracking-[0.18em] uppercase font-bold bg-primary/15 text-primary border border-primary/40 hover:bg-primary/15", children: (z1 = $t.games) == null ? void 0 : z1.name }), jsxRuntimeExports.jsxs(Badge, { className: `rounded-none text-[10px] tracking-[0.18em] uppercase font-bold border ${$t.status === "RUNNING" ? "bg-primary text-primary-foreground border-primary hover:bg-primary" : "bg-transparent text-muted-foreground border-border hover:bg-transparent"}`, children: [$t.status === "RUNNING" && jsxRuntimeExports.jsxs("span", { className: "relative flex h-2 w-2 mr-1", children: [jsxRuntimeExports.jsx("span", { className: "animate-ping absolute h-full w-full rounded-full bg-primary-foreground opacity-60" }), jsxRuntimeExports.jsx("span", { className: "relative rounded-full h-2 w-2 bg-primary-foreground" })] }), lx($t.status)] })] }), jsxRuntimeExports.jsx("h1", { className: "headline text-xl sm:text-2xl md:text-3xl text-foreground truncate", children: $t.name }), (Gx == null ? void 0 : Gx.name) && jsxRuntimeExports.jsx("span", { className: "text-xs font-medium mt-1 block", style: { color: `${$x}66` }, children: Gx.short_name || Gx.name }), (tx == null ? void 0 : tx.name) && jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium mt-1 inline-flex items-center gap-1.5", style: { color: `${$x}88` }, children: [jsxRuntimeExports.jsx(Layers, { className: "h-3 w-3" }), " ", tx.name] })] }), $t.description && jsxRuntimeExports.jsx(Button$1, { variant: "ghost", size: "icon", className: "shrink-0 rounded-full h-8 w-8", style: { color: Mx, backgroundColor: `${Mx}15` }, onClick: () => vn(!0), children: jsxRuntimeExports.jsx(Info$1, { className: "h-3.5 w-3.5" }) })] }), jsxRuntimeExports.jsx(motion.div, { variants: fadeUp$l, custom: 2, className: "w-full", children: jsxRuntimeExports.jsxs("div", { className: "compact-tournament-meta grid grid-cols-2 gap-x-4 gap-y-1 border-y border-border/60 py-1 sm:grid-cols-4 lg:grid-cols-8", children: [((X1 = $t.countries) == null ? void 0 : X1.name) && jsxRuntimeExports.jsxs("div", { className: "min-w-0 px-0 py-1", children: [jsxRuntimeExports.jsx("span", { className: "eyebrow text-[9px] block", children: at("tournamentPublic.country") }), jsxRuntimeExports.jsx("span", { className: "text-xs font-bold whitespace-nowrap text-foreground", children: $t.countries.name })] }), $t.starts_at && jsxRuntimeExports.jsxs("div", { className: "min-w-0 px-0 py-1", children: [jsxRuntimeExports.jsx("span", { className: "eyebrow text-[9px] block", children: at("tournamentPublic.startDate") }), jsxRuntimeExports.jsx("span", { className: "text-xs font-bold whitespace-nowrap text-foreground", children: new Date($t.starts_at).toLocaleDateString() })] }), (Rx == null ? void 0 : Rx.entry_fee) != null && jsxRuntimeExports.jsxs("div", { className: "min-w-0 px-0 py-1", children: [jsxRuntimeExports.jsx("span", { className: "eyebrow text-[9px] block", children: at("tournamentPublic.entryFee") }), jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold whitespace-nowrap text-foreground", children: ["R$ ", Number(Rx.entry_fee).toFixed(2)] })] }), jsxRuntimeExports.jsxs("div", { className: "min-w-0 px-0 py-1", children: [jsxRuntimeExports.jsx("span", { className: "eyebrow text-[9px] block", children: at("tournamentPublic.entrants") }), jsxRuntimeExports.jsx("span", { className: "text-xs font-bold whitespace-nowrap text-foreground", children: D0.length })] }), jsxRuntimeExports.jsxs("div", { className: "min-w-0 px-0 py-1", children: [jsxRuntimeExports.jsx("span", { className: "eyebrow text-[9px] block", children: at("tournamentPublic.game") }), jsxRuntimeExports.jsx("span", { className: "text-xs font-bold whitespace-nowrap text-foreground", children: ((k1 = $t.games) == null ? void 0 : k1.name) || "—" })] }), $t.transfer_window_status && jsxRuntimeExports.jsxs("div", { className: "min-w-0 rounded-md px-2 py-1", style: { backgroundColor: $t.transfer_window_status === "FULL_LOCK" ? "rgba(239,68,68,0.08)" : $t.transfer_window_status === "PARTIAL_LOCK" ? "rgba(234,179,8,0.08)" : "rgba(34,197,94,0.08)" }, children: [jsxRuntimeExports.jsx("span", { className: "eyebrow text-[9px] block", children: "Transferências" }), jsxRuntimeExports.jsx("span", { className: `text-xs font-bold whitespace-nowrap flex items-center gap-1 ${$t.transfer_window_status === "FULL_LOCK" ? "text-red-500" : $t.transfer_window_status === "PARTIAL_LOCK" ? "text-yellow-500" : "text-green-500"}`, children: $t.transfer_window_status === "FULL_LOCK" ? "Fechada Total" : $t.transfer_window_status === "PARTIAL_LOCK" ? "Fechada Parcial" : "Aberta" })] }), Ht.length > 0 && (() => { const k0 = d0 => d0 === "GROUPS" ? at("tournamentPublic.groups") : d0 === "PLAYOFFS" ? at("tournamentPublic.playoffs") : d0 === "LEAGUE" ? at("tournamentPublic.league") : d0, s1 = d0 => d0 === 1 ? at("tournamentPublic.singleMatch") : d0 === 2 ? at("tournamentPublic.homeAway") : `MD${d0}`, n1 = Ht.sort((d0, C0) => d0.stage_order - C0.stage_order).map(d0 => `${k0(d0.stage_type)} ${s1(d0.best_of_default)}`).join(" + "); return jsxRuntimeExports.jsxs("div", { className: "min-w-0 px-0 py-1 lg:col-span-2", children: [jsxRuntimeExports.jsx("span", { className: "eyebrow text-[9px] block", children: at("tournamentPublic.structureLabel") }), jsxRuntimeExports.jsx("span", { className: "text-xs font-bold whitespace-nowrap text-foreground", children: n1 })] }); })(), (Rx == null ? void 0 : Rx.total_prize) && jsxRuntimeExports.jsxs("div", { className: "min-w-0 rounded-md px-2 py-1 bg-primary/10", children: [jsxRuntimeExports.jsxs("span", { className: "eyebrow text-[9px] flex items-center gap-0.5", children: [jsxRuntimeExports.jsx(Trophy, { className: "h-2.5 w-2.5" }), " ", at("tournamentPublic.prizePool")] }), jsxRuntimeExports.jsx("span", { className: "text-xs font-bold whitespace-nowrap text-foreground", children: Rx.total_prize })] })] }) }), $t.status === "REG_OPEN" && !Xr && Ct && jsxRuntimeExports.jsx(motion.div, { variants: fadeUp$l, custom: 2.5, className: "mt-4 flex justify-center", children: jsxRuntimeExports.jsx(Button$1, { onClick: _x, disabled: Kr, className: "min-w-[200px] h-10 text-xs font-bold uppercase tracking-wider", style: { backgroundColor: Mx, color: $x }, children: Kr ? at("tournamentPublic.subscribing") : E0 ? "Lista de Espera" : !$t.is_free && $t.entry_fee > 0 ? `${at("tournamentPublic.subscribe")} — ${formatUSD($t.entry_fee)}` : at("tournamentPublic.subscribe") }) }), $t.status === "REG_OPEN" && Xr && !a0 && jsxRuntimeExports.jsx(motion.p, { variants: fadeUp$l, custom: 2.5, className: "mt-3 text-center text-xs font-medium", style: { color: Mx }, children: at("tournamentPublic.alreadySubscribed") }), a0 && jsxRuntimeExports.jsxs(motion.div, { variants: fadeUp$l, custom: 2.5, className: "mt-4 space-y-2", children: [jsxRuntimeExports.jsxs("p", { className: "text-center text-xs font-medium", style: { color: `${$x}88` }, children: ["⏳ ", at("tournamentPublic.pendingPayment")] }), jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-center", children: [f0 && jsxRuntimeExports.jsxs(Button$1, { onClick: g0, disabled: Hx || i0, className: "gap-1.5 text-xs font-bold", style: { backgroundColor: Mx, color: $x }, size: "sm", children: [Hx ? jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : jsxRuntimeExports.jsx(CreditCard, { className: "h-3.5 w-3.5" }), at("tournamentPublic.payNow")] }), jsxRuntimeExports.jsxs(Button$1, { onClick: Fx, disabled: i0 || Hx, variant: "outline", size: "sm", className: "gap-1.5 text-xs", style: { borderColor: `${$x}30`, color: `${$x}88` }, children: [i0 ? jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }), at("tournamentPublic.cancelRegistration")] })] })] }), $t.status === "REG_OPEN" && !Ct && jsxRuntimeExports.jsx(motion.div, { variants: fadeUp$l, custom: 3.5, className: "mt-6", children: jsxRuntimeExports.jsx(Link, { to: "/login", children: jsxRuntimeExports.jsx(Button$1, { variant: "outline", className: "text-sm", style: { borderColor: `${Mx}60`, color: Mx }, children: at("tournamentPublic.loginToSubscribe") }) }) }), $t.status === "PUBLISHED" && jsxRuntimeExports.jsxs(motion.div, { variants: fadeUp$l, custom: 3.5, className: "mt-6 flex items-center gap-2 justify-center text-sm", style: { color: `${$x}55` }, children: [jsxRuntimeExports.jsx(Lock, { className: "h-4 w-4" }), " ", at("tournamentPublic.regNotOpen")] })] }) })] }) }), jsxRuntimeExports.jsx("section", { "aria-label": "Resumo competitivo", className: "relative border-b border-border/60 bg-card/20", children: jsxRuntimeExports.jsxs("div", { className: "summary-metrics-grid max-w-7xl mx-auto grid grid-cols-2 gap-x-3 gap-y-1 px-4 sm:grid-cols-4 sm:gap-0 sm:px-6 lg:px-8 sm:divide-x sm:divide-y-0 sm:divide-border/60", children: [jsxRuntimeExports.jsx(SummaryMetric, { icon: Users, label: "Participantes", value: `${D0.length}${$t.max_registrations ? ` / ${$t.max_registrations}` : ""}` }), rr.length > 0 && jsxRuntimeExports.jsx(SummaryMetric, { icon: Swords, label: "Partidas", value: rr.length }), rr.length > 0 && jsxRuntimeExports.jsx(SummaryMetric, { icon: Calendar$1, label: "Realizadas", value: I0 }), rr.length > 0 && jsxRuntimeExports.jsx(SummaryMetric, { icon: RefreshCw, label: "Restantes", value: F0 })] }) }), or && jsxRuntimeExports.jsx("section", { className: "max-w-7xl mx-auto px-4 pt-6 sm:px-6 lg:px-8 relative", style: { zIndex: 1 }, children: jsxRuntimeExports.jsx(ChampionCelebration, { tournamentId: $t.id, champion: or, getEntrantLabel: Qx, primaryColor: Mx, accentColor: $x, secondaryColor: Wx, isSolo: ((H1 = $t.games) == null ? void 0 : H1.participant_type) === "SOLO", tournamentStatus: $t.status }) }), Jx && jsxRuntimeExports.jsx("section", { className: "max-w-7xl mx-auto px-4 py-4 relative sm:px-6 lg:px-8", style: { zIndex: 1 }, children: jsxRuntimeExports.jsx(LiveTransferTicker, { federationId: Jx }) }), h0 && o0 && jsxRuntimeExports.jsx("section", { className: "max-w-7xl mx-auto px-4 py-4 relative sm:px-6 lg:px-8", style: { zIndex: 1 }, children: jsxRuntimeExports.jsx(EasyOwnerPanel, { tournament: $t, entrants: Kt, series: rr, stages: Ht, getEntrantLabel: Qx, onRefresh: fx, primaryColor: Mx, accentColor: $x }) }), jsxRuntimeExports.jsx("section", { className: "relative py-12 px-4 sm:px-6", style: { zIndex: 1 }, children: jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto", children: jsxRuntimeExports.jsxs(Tabs, { defaultValue: "standings", children: [jsxRuntimeExports.jsx("style", { children: `
                .themed-tabs [data-state="active"] {
                  background-color: ${Mx}1F !important;
                  color: ${Mx} !important;
                  border-color: ${Mx}59 !important;
                }
              ` }), jsxRuntimeExports.jsx(TabsList, { className: "themed-tabs competition-tabs competition-tabs--seven w-full h-auto gap-1", children: [{ value: "standings", label: at("tournamentPublic.tabStandings"), icon: ChartColumn }, { value: "matches", label: at("tournamentPublic.tabMatches"), icon: Swords }, { value: "bracket", label: at("tournamentPublic.tabPlayoffs"), icon: GitBranch }, { value: "stats", label: "Estatísticas", icon: Award }, ...$t.status === "FINISHED" || $t.status === "ARCHIVED" ? [{ value: "tournament-selection", label: "Seleção", icon: Trophy }] : [{ value: "selection", label: "Seleção", icon: Star }], { value: "structure", label: at("tournamentPublic.tabStructure"), icon: Layers }, { value: "entrants", label: at("tournamentPublic.tabEntrants"), icon: Users }].map(k0 => jsxRuntimeExports.jsxs(TabsTrigger, { value: k0.value, title: k0.label, className: "competition-tab flex-1 min-w-0 data-[state=active]:shadow-none", children: [jsxRuntimeExports.jsx(k0.icon, { className: "h-3.5 w-3.5 shrink-0" }), " ", jsxRuntimeExports.jsx("span", { className: "hidden md:inline", children: k0.label })] }, k0.value)) }), jsxRuntimeExports.jsx(TabsContent, { value: "entrants", forceMount: !0, className: "mt-6 space-y-2", children: V0.length === 0 ? jsxRuntimeExports.jsx(EmptyBlock, { text: at("tournamentPublic.noEntrants"), accentColor: $x }) : jsxRuntimeExports.jsx("div", { className: "space-y-2", children: V0.map(k0 => { var c1, _0, b0, u1, v1, I1, J1, q1; const s1 = Qx(k0), n1 = !!k0.easy_custom_team_id, d0 = ((c1 = $t.games) == null ? void 0 : c1.participant_type) === "SOLO", C0 = n1 ? void 0 : d0 ? `/p/${(_0 = k0.player_profiles) == null ? void 0 : _0.id}` : `/t/${(b0 = k0.teams) == null ? void 0 : b0.id}`, h1 = d0 ? ((u1 = k0.player_profiles) == null ? void 0 : u1.user_id) || k0.player_profile_id : (v1 = k0.teams) == null ? void 0 : v1.id, H0 = Hr[h1] || "free", T1 = Tx(k0), M1 = n1 ? (I1 = k0.easy_custom_teams) == null ? void 0 : I1.logo_object_key : d0 ? (J1 = k0.player_profiles) == null ? void 0 : J1.photo_object_key : (q1 = k0.teams) == null ? void 0 : q1.emblem_object_key, L1 = M1 ? `${supabaseUrl$u}/storage/v1/object/public/${n1 ? "easy-league-assets" : d0 ? "player-photos" : "team-emblems"}/${M1}` : null, T0 = jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:-translate-y-0.5", style: { border: `1px solid ${$x}0A`, backgroundColor: `${$x}04` }, children: [jsxRuntimeExports.jsx("div", { className: "shrink-0 h-9 w-9 rounded-full overflow-hidden flex items-center justify-center", style: { backgroundColor: `${$x}10` }, children: jsxRuntimeExports.jsx("img", { src: d0 ? playerPhotoUrl(M1) : L1 || "", alt: s1, className: "h-full w-full object-cover" }) }), jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 flex items-center gap-2 flex-wrap", children: [jsxRuntimeExports.jsx("span", { className: "text-sm font-medium truncate", style: { color: $x }, children: s1 }), H0 !== "free" && jsxRuntimeExports.jsx(PlanBadge, { plan: H0, size: "sm" })] }), jsxRuntimeExports.jsxs("div", { className: "shrink-0 flex items-center gap-2", children: [jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold px-2 py-0.5 rounded-full", style: { backgroundColor: `${T1.color}20`, color: T1.color }, children: T1.label }), k0.seed && jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px]", style: { borderColor: `${Mx}40`, color: Mx }, children: ["Seed ", k0.seed] }), C0 && jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5", style: { color: `${$x}33` } })] })] }); return jsxRuntimeExports.jsx("div", { children: C0 ? jsxRuntimeExports.jsx(Link, { to: C0, children: T0 }) : T0 }, k0.id); }) }) }), jsxRuntimeExports.jsx(TabsContent, { value: "matches", forceMount: !0, className: "mt-6", children: jsxRuntimeExports.jsx(SmartCalendar, { series: rr, stages: Ht, entrants: Kt, getEntrantLabel: Qx, primaryColor: Mx, accentColor: $x, calendarTier: Lt, userEntrantIds: Mo }) }), jsxRuntimeExports.jsx(TabsContent, { value: "bracket", forceMount: !0, className: "mt-6 min-w-0 max-w-full overflow-x-auto overscroll-x-contain rounded-lg border border-border/50 bg-card/10 p-2 sm:p-4", children: Ht.filter(k0 => k0.stage_type === "PLAYOFFS").length === 0 ? jsxRuntimeExports.jsx(EmptyBlock, { text: at("tournamentPublic.noBracket"), accentColor: $x }) : Ht.filter(k0 => k0.stage_type === "PLAYOFFS").map(k0 => o0 ? jsxRuntimeExports.jsx(EasyBracketTree, { stageId: k0.id, getEntrantLabel: Qx, championEntrantId: $t.champion_entrant_id, refreshKey: Uo, tournamentLogoUrl: N0 }, `${k0.id}-${Uo}`) : jsxRuntimeExports.jsx(BracketTree, { stageId: k0.id, getEntrantLabel: Qx, championEntrantId: $t.champion_entrant_id, primaryColor: Mx, accentColor: $x, secondaryColor: Wx, isEasyMode: o0, refreshKey: Uo, trophyUrl: Kx }, `${k0.id}-${Uo}`)) }), jsxRuntimeExports.jsx(TabsContent, { value: "standings", forceMount: !0, className: "mt-6", children: (() => { var h1, H0, T1, M1, ny; const k0 = Ht.find(L1 => L1.stage_type === "GROUPS"), s1 = (k0 == null ? void 0 : k0.stage_groups) || [], n1 = (Rx == null ? void 0 : Rx.advance_per_group) ?? null; if (s1.length > 1)
                                    return jsxRuntimeExports.jsxs("div", { className: "grid gap-x-6 gap-y-8 lg:grid-cols-2", children: [s1.sort((L1, T0) => L1.name.localeCompare(T0.name)).map(L1 => { var _0, b0; const T0 = jr.filter(u1 => u1.group_id === L1.id), c1 = T0.length > 0 ? T0 : Q0(L1, k0.id); return c1.length === 0 ? null : jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [jsxRuntimeExports.jsx("p", { className: "eyebrow mb-4 px-1", children: L1.name }), jsxRuntimeExports.jsx(StandingsTable, { standings: c1, getEntrantLabel: Qx, primaryColor: Mx, secondaryColor: Wx, accentColor: $x, advanceCount: n1, participantType: (_0 = $t.games) == null ? void 0 : _0.participant_type, entrantPlans: Hr, gameName: (b0 = $t.games) == null ? void 0 : b0.name, structureDesc: "", hideImageGen: !0, noScroll: !0, hideTitle: !0 })] }, L1.id); }), jsxRuntimeExports.jsxs("div", { className: "min-w-0 lg:col-span-2", children: [jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold uppercase tracking-wider mb-3 px-1", style: { color: Mx || "hsl(var(--foreground))" }, children: at("tournamentPublic.overallStandings") }), jsxRuntimeExports.jsx(StandingsTable, { standings: y1(k0.id), getEntrantLabel: Qx, primaryColor: Mx, secondaryColor: Wx, accentColor: $x, advanceCount: Ix, participantType: (h1 = $t.games) == null ? void 0 : h1.participant_type, entrantPlans: Hr, tournamentName: $t.name, gameName: (H0 = $t.games) == null ? void 0 : H0.name, structureDesc: A0, hideImageGen: !0, noScroll: !0 })] })] }); const d0 = (k0 == null ? void 0 : k0.id) || ((T1 = Ht[0]) == null ? void 0 : T1.id), C0 = y1(d0); return jsxRuntimeExports.jsx(StandingsTable, { standings: C0, getEntrantLabel: Qx, primaryColor: Mx, secondaryColor: Wx, accentColor: $x, advanceCount: Ix, participantType: (M1 = $t.games) == null ? void 0 : M1.participant_type, entrantPlans: Hr, tournamentName: $t.name, gameName: (ny = $t.games) == null ? void 0 : ny.name, structureDesc: A0, hideImageGen: !0, noScroll: !0 }); })() }), jsxRuntimeExports.jsx(TabsContent, { value: "structure", forceMount: !0, className: "mt-6", children: jsxRuntimeExports.jsx(TournamentStructureTab, { tournament: $t, stages: Ht, primaryColor: Mx, accentColor: $x }) }), !($t.status === "FINISHED" || $t.status === "ARCHIVED") && jsxRuntimeExports.jsx(TabsContent, { value: "selection", forceMount: !0, className: "mt-6", children: jsxRuntimeExports.jsx(TeamSelectionTab, { tournamentId: $t.id, primaryColor: Mx, accentColor: $x, secondaryColor: Wx }) }), ($t.status === "FINISHED" || $t.status === "ARCHIVED") && jsxRuntimeExports.jsx(TabsContent, { value: "tournament-selection", forceMount: !0, className: "mt-6", children: jsxRuntimeExports.jsx(TeamSelectionTab, { tournamentId: $t.id, primaryColor: Mx, accentColor: $x, secondaryColor: Wx, mode: "tournament" }) }), jsxRuntimeExports.jsxs(TabsContent, { value: "stats", forceMount: !0, className: "mt-6 space-y-6", children: [o0 && jsxRuntimeExports.jsx(EasyPlayerStatsTable, { tournamentId: $t.id, refreshKey: Uo }), jsxRuntimeExports.jsx(TournamentStatsTab, { tournamentId: $t.id, primaryColor: Mx, accentColor: $x, secondaryColor: Wx })] })] }) }) }), Gx && jsxRuntimeExports.jsx("section", { className: "relative py-12 px-4 text-center", style: { borderTop: `1px solid ${$x}08`, zIndex: 1 }, children: jsxRuntimeExports.jsxs(Link, { to: st ? "/" : `/org/${Gx.id}`, className: "inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider", style: { color: Mx }, children: [x0 && jsxRuntimeExports.jsx("img", { src: x0, alt: "", className: "h-6 w-6 object-contain" }), Gx.name, jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3" })] }) }), !st && jsxRuntimeExports.jsx(PublicFooter, {}), ko && $t.description && jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", onClick: () => vn(!1), children: [jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/60 backdrop-blur-sm" }), jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, scale: .95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: .95 }, transition: { duration: .2 }, className: "relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-xl overflow-hidden", style: { backgroundColor: Wx, border: `1px solid ${$x}15` }, onClick: k0 => k0.stopPropagation(), children: [jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-5 py-4 shrink-0", style: { borderBottom: `1px solid ${$x}10` }, children: [jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [jsxRuntimeExports.jsx(Info$1, { className: "h-4 w-4", style: { color: Mx } }), jsxRuntimeExports.jsx("h3", { className: "font-display font-bold text-sm uppercase tracking-wider", style: { color: $x }, children: "Informações" })] }), jsxRuntimeExports.jsx("button", { onClick: () => vn(!1), className: "p-1 rounded-lg transition-colors hover:opacity-80", style: { backgroundColor: `${$x}08` }, children: jsxRuntimeExports.jsx(X$2, { className: "h-4 w-4", style: { color: `${$x}66` } }) })] }), jsxRuntimeExports.jsx("div", { className: "flex-1 min-h-0 overflow-y-auto px-5 py-4", children: jsxRuntimeExports.jsx("p", { className: "text-sm whitespace-pre-wrap leading-relaxed", style: { color: `${$x}BB` }, children: $t.description }) })] })] }), jsxRuntimeExports.jsx(TeamSelectDialog, { open: Tn, onOpenChange: Ro, isSolo: ((U1 = $t.games) == null ? void 0 : U1.participant_type) === "SOLO", eligibleTeams: Bo, eligibleProfiles: An, selectedTeamId: Sn, setSelectedTeamId: Go, selectedProfileId: ax, setSelectedProfileId: ox, registering: Kr, onConfirm: () => { var s1; ((s1 = $t.games) == null ? void 0 : s1.participant_type) === "SOLO" ? Vx(ax, null) : Vx(null, Sn); } }), jsxRuntimeExports.jsx(PaymentMethodSelector, { open: xx, onOpenChange: mx, onSelectStripe: s0, onSelectPix: v0, loading: yx, amount: dx ? dx.fee.toFixed(2).replace(".", ",") : void 0, showCard: ($t == null ? void 0 : $t.accept_card) !== !1, showPix: ($t == null ? void 0 : $t.accept_pix) !== !1 }), jsxRuntimeExports.jsx(SavedCpfCnpjModal, { open: qx.showSavedCpfModal, onOpenChange: qx.setShowSavedCpfModal, cpfCnpj: qx.savedCpfCnpj, onUseSaved: qx.confirmSavedCpfAndCreatePix, onUseDifferent: qx.useDifferentCpfCnpj, loading: qx.pixLoading }), jsxRuntimeExports.jsx(CpfCnpjInputModal, { open: qx.showCpfModal, onOpenChange: qx.setShowCpfModal, onConfirm: qx.confirmCpfAndCreatePix, loading: qx.pixLoading }), Ex && jsxRuntimeExports.jsx(PixCheckoutModal, { open: !!Ex, onOpenChange: k0 => { k0 || Px(null); }, paymentId: Ex.payment_id, txid: Ex.txid, qrCodeImage: Ex.qr_code_image, pixCopyPaste: Ex.pix_copy_paste, expiresAt: Ex.expires_at, amount: Ex.amount, onPaymentConfirmed: () => { Px(null), No(k0 => k0 + 1), ue$1.success(at("tournamentPublic.paymentConfirmed")); } })] });const eventPieces=eventTree.props.children;
return jsxRuntimeExports.jsxs('div',{className:'cbpro-event',children:[eventPieces[1],jsxRuntimeExports.jsxs('div',{className:'cbpro-event-layout',children:[jsxRuntimeExports.jsx('header',{className:'cbpro-event-identity',children:eventPieces[3]}),jsxRuntimeExports.jsxs('aside',{className:'cbpro-event-summary',children:[jsxRuntimeExports.jsx('h2',{children:'A competição em números'}),eventPieces[4],eventPieces[7]]}),jsxRuntimeExports.jsxs('main',{className:'cbpro-event-content',children:[eventPieces[5],eventPieces[6],eventPieces[8],eventPieces[9]]})]}),eventPieces[2],eventPieces[10],...eventPieces.slice(11)]});
}