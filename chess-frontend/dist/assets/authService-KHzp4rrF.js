import{c as s}from"./index-CGWtbK7z.js";import{a as e}from"./api-Hd4tkP_C.js";/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n=s("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]),c={login:async t=>(await e.post("/auth/login",t)).data,register:async t=>(await e.post("/auth/register",t)).data,getMe:async()=>(await e.get("/auth/me")).data,logout:async()=>(await e.post("/auth/logout")).data};export{n as L,c as a};
