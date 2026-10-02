
const {} = globalThis;
const emptyInvites={teamInvites:[],managerInvites:[],nationalManagerInvites:[],nationalPlayerInvites:[]},userInvitesQueryKey=(i,o=!1)=>["user-invites",i,o?"pending":"all"],pendingInvitesCountQueryKey=i=>["pending-invites-count",i];
export {emptyInvites,userInvitesQueryKey,pendingInvitesCountQueryKey};
