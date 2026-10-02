
const {} = globalThis;
function sortStandings(i){return i.sort(standingsComparator)}
function standingsComparator(i,o){return o.points-i.points||o.wins-i.wins||o.score_diff-i.score_diff||o.score_for-i.score_for||i.score_against-o.score_against}
export {sortStandings,standingsComparator};
