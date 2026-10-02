import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

// Lazy load all pages for code splitting
// ═══ Public Pages ═══
const Landing = lazy(() => import('@/pages/Landing'))
const Login = lazy(() => import('@/pages/Login'))
const Signup = lazy(() => import('@/pages/Signup'))
const ResetPassword = lazy(() => import('@/pages/ResetPassword'))
const Privacy = lazy(() => import('@/pages/Privacy'))
const Pricing = lazy(() => import('@/pages/Pricing'))
const TournamentsPublic = lazy(() => import('@/pages/TournamentsPublic'))
const TeamsPublic = lazy(() => import('@/pages/TeamsPublic'))
const PlayersPublic = lazy(() => import('@/pages/PlayersPublic'))
const FantasyPublic = lazy(() => import('@/pages/FantasyPublic'))
const FantasyPublicLeague = lazy(() => import('@/pages/FantasyPublicLeague'))
const FantasyPublicMarket = lazy(() => import('@/pages/FantasyPublicMarket'))
const PublicProfile = lazy(() => import('@/pages/PublicProfile'))
const PublicTeam = lazy(() => import('@/pages/PublicTeam'))
const PublicTournament = lazy(() => import('@/pages/PublicTournament'))
const PublicFederation = lazy(() => import('@/pages/PublicFederation'))
const PublicSlug = lazy(() => import('@/pages/PublicSlug'))
const BlogPost = lazy(() => import('@/pages/BlogPost'))
const Champions = lazy(() => import('@/pages/Champions'))
const Regulamentos = lazy(() => import('@/pages/Regulamentos'))

// ═══ Auth-Required Pages ═══
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Onboarding = lazy(() => import('@/pages/Onboarding'))
const DeleteAccount = lazy(() => import('@/pages/DeleteAccount'))

// Tournaments
const Tournaments = lazy(() => import('@/pages/tournaments/Tournaments'))
const TournamentDetail = lazy(() => import('@/pages/tournaments/TournamentDetail'))

// Easy Tournaments
const TorneioFacil = lazy(() => import('@/pages/easy/TorneioFacil'))
const TorneioFacilCriar = lazy(() => import('@/pages/easy/TorneioFacilCriar'))

// Teams
const Teams = lazy(() => import('@/pages/teams/Teams'))
const Transfers = lazy(() => import('@/pages/teams/Transfers'))
const Invites = lazy(() => import('@/pages/teams/Invites'))

// Players
const Profiles = lazy(() => import('@/pages/players/Profiles'))
const RnkPlayers = lazy(() => import('@/pages/players/RnkPlayers'))

// Federations / Orgs
const Orgs = lazy(() => import('@/pages/orgs/Orgs'))
const OrgManage = lazy(() => import('@/pages/orgs/OrgManage'))
const OrgRequest = lazy(() => import('@/pages/orgs/OrgRequest'))
const MyOrgs = lazy(() => import('@/pages/orgs/MyOrgs'))


// Rankings & ELO
const Ranked = lazy(() => import('@/pages/ranked/Ranked'))
const RankedAdmin = lazy(() => import('@/pages/ranked/RankedAdmin'))

// Fantasy
const Fantasy = lazy(() => import('@/pages/fantasy/Fantasy'))
const FantasyLeagues = lazy(() => import('@/pages/fantasy/FantasyLeagues'))
const FantasyLeagueDetail = lazy(() => import('@/pages/fantasy/FantasyLeagueDetail'))
const FantasyCreateTeam = lazy(() => import('@/pages/fantasy/FantasyCreateTeam'))
const FantasyLineup = lazy(() => import('@/pages/fantasy/FantasyLineup'))
const FantasyMarket = lazy(() => import('@/pages/fantasy/FantasyMarket'))
const FantasyRankings = lazy(() => import('@/pages/fantasy/FantasyRankings'))
const FantasyStore = lazy(() => import('@/pages/fantasy/FantasyStore'))


// Recruitment
const Recruitment = lazy(() => import('@/pages/Recruitment'))

// Friendlies
const Friendlies = lazy(() => import('@/pages/Friendlies'))



// Credits & Checkout
const Checkout = lazy(() => import('@/pages/payments/Checkout'))
const CreditsSuccess = lazy(() => import('@/pages/payments/CreditsSuccess'))
const CreditsCanceled = lazy(() => import('@/pages/payments/CreditsCanceled'))
const StripeConnectReturn = lazy(() => import('@/pages/payments/StripeConnectReturn'))

// Social
const SocialMedia = lazy(() => import('@/pages/SocialMedia'))

// Admin
const Admin = lazy(() => import('@/pages/admin/Admin'))

// Loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#0A2560] border-t-transparent rounded-full animate-spin" />
        <span className="text-[#3A4566] text-sm ">Carregando...</span>
      </div>
    </div>
  )
}

function SuspenseWrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

// Layout imports
import { PublicLayout } from '@/components/layout/PublicLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export const router = createBrowserRouter([
  // ═══════════════════════════════════════
  // PUBLIC ROUTES
  // ═══════════════════════════════════════
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <SuspenseWrap><Landing /></SuspenseWrap> },
      { path: '/login', element: <SuspenseWrap><Login /></SuspenseWrap> },
      { path: '/signup', element: <SuspenseWrap><Signup /></SuspenseWrap> },
      { path: '/reset-password', element: <SuspenseWrap><ResetPassword /></SuspenseWrap> },
      { path: '/forgot-password', element: <SuspenseWrap><ResetPassword /></SuspenseWrap> },
      { path: '/privacy', element: <SuspenseWrap><Privacy /></SuspenseWrap> },
      { path: '/pricing', element: <SuspenseWrap><Pricing /></SuspenseWrap> },
      { path: '/tournaments-public', element: <SuspenseWrap><TournamentsPublic /></SuspenseWrap> },
      { path: '/teams-public', element: <SuspenseWrap><TeamsPublic /></SuspenseWrap> },
      { path: '/players-public', element: <SuspenseWrap><PlayersPublic /></SuspenseWrap> },
      { path: '/champions', element: <SuspenseWrap><Champions /></SuspenseWrap> },
      { path: '/regulamentos', element: <SuspenseWrap><Regulamentos /></SuspenseWrap> },
      { path: '/fantasy-public', element: <SuspenseWrap><FantasyPublic /></SuspenseWrap> },
      { path: '/fantasy-public/league/:id', element: <SuspenseWrap><FantasyPublicLeague /></SuspenseWrap> },
      { path: '/fantasy-public/market', element: <SuspenseWrap><FantasyPublicMarket /></SuspenseWrap> },
      { path: '/p/:profileId', element: <SuspenseWrap><PublicProfile /></SuspenseWrap> },
      { path: '/t/:teamId', element: <SuspenseWrap><PublicTeam /></SuspenseWrap> },
      { path: '/tournament/:id', element: <SuspenseWrap><PublicTournament /></SuspenseWrap> },
      { path: '/org/:federationId', element: <SuspenseWrap><PublicFederation /></SuspenseWrap> },
      { path: '/s/:slug', element: <SuspenseWrap><PublicSlug /></SuspenseWrap> },
      { path: '/blog/:postId', element: <SuspenseWrap><BlogPost /></SuspenseWrap> },
    ],
  },

  // ═══════════════════════════════════════
  // AUTHENTICATED ROUTES
  // ═══════════════════════════════════════
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard', element: <SuspenseWrap><Dashboard /></SuspenseWrap> },
      { path: '/onboarding', element: <SuspenseWrap><Onboarding /></SuspenseWrap> },
      { path: '/delete-account', element: <SuspenseWrap><DeleteAccount /></SuspenseWrap> },

      // Tournaments
      { path: '/tournaments', element: <SuspenseWrap><Tournaments /></SuspenseWrap> },
      { path: '/tournaments/:id', element: <SuspenseWrap><TournamentDetail /></SuspenseWrap> },

      // Easy Tournaments
      { path: '/torneio-facil', element: <SuspenseWrap><TorneioFacil /></SuspenseWrap> },
      { path: '/torneio-facil/criar', element: <SuspenseWrap><TorneioFacilCriar /></SuspenseWrap> },

      // Teams
      { path: '/teams', element: <SuspenseWrap><Teams /></SuspenseWrap> },
      { path: '/transfers', element: <SuspenseWrap><Transfers /></SuspenseWrap> },
      { path: '/invites', element: <SuspenseWrap><Invites /></SuspenseWrap> },

      // Players
      { path: '/profiles', element: <SuspenseWrap><Profiles /></SuspenseWrap> },
      { path: '/rnk-players', element: <SuspenseWrap><RnkPlayers /></SuspenseWrap> },

      // Federations
      { path: '/orgs', element: <SuspenseWrap><Orgs /></SuspenseWrap> },
      { path: '/org-manage/:federationId', element: <SuspenseWrap><OrgManage /></SuspenseWrap> },
      { path: '/org/request', element: <SuspenseWrap><OrgRequest /></SuspenseWrap> },
      { path: '/my-orgs', element: <SuspenseWrap><MyOrgs /></SuspenseWrap> },

      { path: '/games', element: <Navigate to="/" replace /> },
      { path: '/games/:id', element: <Navigate to="/" replace /> },

      // Rankings
      { path: '/ranked', element: <SuspenseWrap><Ranked /></SuspenseWrap> },

      // Fantasy
      { path: '/fantasy', element: <SuspenseWrap><Fantasy /></SuspenseWrap> },
      { path: '/fantasy/leagues', element: <SuspenseWrap><FantasyLeagues /></SuspenseWrap> },
      { path: '/fantasy/league/:leagueId', element: <SuspenseWrap><FantasyLeagueDetail /></SuspenseWrap> },
      { path: '/fantasy/create-team', element: <SuspenseWrap><FantasyCreateTeam /></SuspenseWrap> },
      { path: '/fantasy/lineup', element: <SuspenseWrap><FantasyLineup /></SuspenseWrap> },
      { path: '/fantasy/market', element: <SuspenseWrap><FantasyMarket /></SuspenseWrap> },
      { path: '/fantasy/rankings', element: <SuspenseWrap><FantasyRankings /></SuspenseWrap> },
      { path: '/fantasy/store', element: <SuspenseWrap><FantasyStore /></SuspenseWrap> },

      { path: '/draft', element: <Navigate to="/" replace /> },
      { path: '/draft/:id', element: <Navigate to="/" replace /> },
      { path: '/draft/create', element: <Navigate to="/" replace /> },

      // Recruitment
      { path: '/recruitment', element: <SuspenseWrap><Recruitment /></SuspenseWrap> },

      // Friendlies
      { path: '/friendlies', element: <SuspenseWrap><Friendlies /></SuspenseWrap> },

      { path: '/gamebet', element: <Navigate to="/" replace /> },

      { path: '/avatars', element: <Navigate to="/" replace /> },
      { path: '/marketplace', element: <Navigate to="/" replace /> },
      { path: '/my-collection', element: <Navigate to="/" replace /> },

      // Payments
      { path: '/checkout', element: <SuspenseWrap><Checkout /></SuspenseWrap> },
      { path: '/credits/success', element: <SuspenseWrap><CreditsSuccess /></SuspenseWrap> },
      { path: '/credits/canceled', element: <SuspenseWrap><CreditsCanceled /></SuspenseWrap> },
      { path: '/stripe-connect-return', element: <SuspenseWrap><StripeConnectReturn /></SuspenseWrap> },

      // Social
      { path: '/social-media', element: <SuspenseWrap><SocialMedia /></SuspenseWrap> },

      // Admin
    ],
  },

  {
    element: <ProtectedRoute requireAdmin />,
    children: [
      { path: '/admin', element: <SuspenseWrap><Admin /></SuspenseWrap> },
      { path: '/ranked-admin', element: <SuspenseWrap><RankedAdmin /></SuspenseWrap> },
    ],
  },

  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
])
