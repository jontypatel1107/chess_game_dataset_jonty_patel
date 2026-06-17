import{c as a}from"./index-CGWtbK7z.js";import{a as t}from"./api-Hd4tkP_C.js";/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=a("CircleDot",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=a("PlayCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polygon",{points:"10 8 16 12 10 16 10 8",key:"1cimsy"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=a("Tag",[["path",{d:"M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z",key:"14b2ls"}],["path",{d:"M7 7h.01",key:"7u93v4"}]]),i={getAllTournaments:async e=>(await t.get("/tournaments",{params:e})).data,getTournamentById:async e=>(await t.get(`/tournaments/${e}`)).data,createTournament:async e=>(await t.post("/tournaments",e)).data,updateTournament:async(e,n)=>(await t.put(`/tournaments/${e}`,n)).data,deleteTournament:async e=>(await t.delete(`/tournaments/${e}`)).data,registerForTournament:async e=>(await t.post(`/tournaments/${e}/register`)).data,getTournamentStats:async()=>(await t.get("/tournaments/stats")).data};export{c as C,p as P,u as T,i as t};
