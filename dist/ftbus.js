!function(e){var o={};function r(t){if(o[t])return o[t].exports;var n=o[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,r),n.l=!0,n.exports}r.m=e,r.c=o,r.d=function(e,o,t){r.o(e,o)||Object.defineProperty(e,o,{enumerable:!0,get:t})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,o){if(1&o&&(e=r(e)),8&o)return e;if(4&o&&"object"==typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(r.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&o&&"string"!=typeof e)for(var n in e)r.d(t,n,function(o){return e[o]}.bind(null,n));return t},r.n=function(e){var o=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(o,"a",o),o},r.o=function(e,o){return Object.prototype.hasOwnProperty.call(e,o)},r.p="",r(r.s=22)}([function(e,o){e.exports=require("koa-router")},function(e,o){e.exports=require("cron")},function(e,o){e.exports=require("minimist")},function(e,o,r){const t=r(2);e.exports={parseArgs:()=>{const e=t(process.argv.slice(2));return(({config:e})=>!!e||(console.error("No config file specified, exemple: --config ./config/config.json"),!1))(e)?e:null}}},function(e,o){e.exports=require("fs")},function(e,o){e.exports=function(e){if(!e.webpackPolyfill){var o=Object.create(e);o.children||(o.children=[]),Object.defineProperty(o,"loaded",{enumerable:!0,get:function(){return o.l}}),Object.defineProperty(o,"id",{enumerable:!0,get:function(){return o.i}}),Object.defineProperty(o,"exports",{enumerable:!0}),o.webpackPolyfill=1}return o}},function(e,o,r){"use strict";r.r(o),function(e){var o=r(1);const t=r(4),n=r(3);e.exports={getConfig:e=>{const r=n.parseArgs();if(!r)return console.error("Args validity check failed!"),!1;const{config:s}=r;if(!s.endsWith(".json"))return console.error("You must provide a json file for the configuration!"),!1;const i=JSON.parse(t.readFileSync(s,"utf8"));return i?(i.forEach((e,r)=>{const{nodeId:t,protocol:n,mode:s}=e;if(console.log(`Element n°${r}: `,t,n,s),"poll"===s){const{freq:n}=e;if(!n)return console.error(`Frequence was not defined for poll mode in the element ${r}!`),!1;try{const e=new o.CronJob({cronTime:n,onTick:()=>{console.log("Poll mode job for nodeId: ",t)},start:!0});console.info("Job status: ",e.running)}catch(e){console.error(`Cron pattern is not valid for ${n}. `,e)}}return e}),!0):(console.error(`The file ${s} could not be loaded!`),!1)}}}.call(this,r(5)(e))},function(e,o,r){const t=new(r(0)),n=r(6);t.get("/",n.getConfig),e.exports=t.routes()},function(e,o){e.exports={getNode:function(e){const{query:o}=e.request,{node:r}=o,t=e.request.header.authorization||"";if(!t.startsWith("Basic "))throw new Error("The authorization header is either empty or isn't Basic.");{const e=t.split(" ")[1],o=Buffer.from(e,"base64").toString().split(":"),r=o[0],n=o[1];console.log(`request from ${r} with password:${n}`)}e.ok({node:r,query:o,comment:" node was requested!"})}}},function(e,o,r){const t=new(r(0)),n=r(8);t.get("/",n.getNode),e.exports=t.routes()},function(e,o){e.exports={getUser:function(e){const{query:o}=e.request,{user:r}=o;e.ok({user:r,query:o,comment:" user was requested!"})}}},function(e,o,r){const t=new(r(0)),n=r(10);t.get("/",n.getUser),e.exports=t.routes()},function(e,o,r){const t=r(11),n=r(9),s=r(7);e.exports=(e=>{e.prefix("/v1"),e.use("/users",t),e.use("/nodes",n),e.use("/config",s)})},function(e,o){e.exports=require("koa-respond")},function(e,o){e.exports=require("koa-helmet")},function(e,o){e.exports=require("koa-bodyparser")},function(e,o,r){"use strict";e.exports=function(e){return e=Object.assign({},{allowMethods:"GET,HEAD,PUT,POST,DELETE,PATCH"},e),Array.isArray(e.exposeHeaders)&&(e.exposeHeaders=e.exposeHeaders.join(",")),Array.isArray(e.allowMethods)&&(e.allowMethods=e.allowMethods.join(",")),Array.isArray(e.allowHeaders)&&(e.allowHeaders=e.allowHeaders.join(",")),e.maxAge&&(e.maxAge=String(e.maxAge)),e.credentials=!!e.credentials,e.keepHeadersOnError=void 0===e.keepHeadersOnError||!!e.keepHeadersOnError,function(o,r){const t=o.get("Origin");if(o.vary("Origin"),!t)return r();let n;if("function"==typeof e.origin){if(!(n=e.origin(o)))return r()}else n=e.origin||t;const s={};function i(e,r){o.set(e,r),s[e]=r}if("OPTIONS"!==o.method)return i("Access-Control-Allow-Origin",n),!0===e.credentials&&i("Access-Control-Allow-Credentials","true"),e.exposeHeaders&&i("Access-Control-Expose-Headers",e.exposeHeaders),e.keepHeadersOnError?r().catch(e=>{throw e.headers=Object.assign({},e.headers,s),e}):r();{if(!o.get("Access-Control-Request-Method"))return r();o.set("Access-Control-Allow-Origin",n),!0===e.credentials&&o.set("Access-Control-Allow-Credentials","true"),e.maxAge&&o.set("Access-Control-Max-Age",e.maxAge),e.allowMethods&&o.set("Access-Control-Allow-Methods",e.allowMethods);let t=e.allowHeaders;t||(t=o.get("Access-Control-Request-Headers")),t&&o.set("Access-Control-Allow-Headers",t),o.status=204}}}},function(e,o){e.exports=require("koa-logger")},function(e,o){e.exports=require("koa-basic-auth")},function(e,o){e.exports=require("koa")},function(e,o,r){const t=r(19),n=r(0),s=r(18),i=(r(17),r(16)),c=r(15),u=r(14),a=r(13),l=new t,f=new n;l.use(u()),l.use(async(e,o)=>{try{await o()}catch(o){if(401!==o.status)throw o;e.status=401,e.set("WWW-Authenticate","Basic"),e.body="access was not authorized"}}),l.use(s({name:"jf",pass:"jfhjfh"})),l.use(i()),l.use(c({enableTypes:["json"],jsonLimit:"5mb",strict:!0,onerror(e,o){o.throw("body parse error",422)}})),l.use(a()),r(12)(f),l.use(f.routes()),l.use(f.allowedMethods()),e.exports=l},function(e,o){e.exports=require("dotenv")},function(e,o,r){r(21).config();const t=r(20),n=process.env.PORT||3333;t.listen(n,()=>console.log(`API server started on ${n}`))}]);