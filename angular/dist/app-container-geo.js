/*
 * app-container-geo
 * Version: 1.0.0 - 2017-01-31
 */

/*! sprintf-js | Alexandru Marasteanu <hello@alexei.ro> (http://alexei.ro/) | BSD-3-Clause */

!function(a){function b(){var a=arguments[0],c=b.cache;return c[a]&&c.hasOwnProperty(a)||(c[a]=b.parse(a)),b.format.call(null,c[a],arguments)}function c(a){return Object.prototype.toString.call(a).slice(8,-1).toLowerCase()}function d(a,b){return Array(b+1).join(a)}var e={not_string:/[^s]/,number:/[diefg]/,json:/[j]/,not_json:/[^j]/,text:/^[^\x25]+/,modulo:/^\x25{2}/,placeholder:/^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijosuxX])/,key:/^([a-z_][a-z_\d]*)/i,key_access:/^\.([a-z_][a-z_\d]*)/i,index_access:/^\[(\d+)\]/,sign:/^[\+\-]/};b.format=function(a,f){var g,h,i,j,k,l,m,n=1,o=a.length,p="",q=[],r=!0,s="";for(h=0;o>h;h++)if(p=c(a[h]),"string"===p)q[q.length]=a[h];else if("array"===p){if(j=a[h],j[2])for(g=f[n],i=0;i<j[2].length;i++){if(!g.hasOwnProperty(j[2][i]))throw new Error(b("[sprintf] property '%s' does not exist",j[2][i]));g=g[j[2][i]]}else g=j[1]?f[j[1]]:f[n++];if("function"==c(g)&&(g=g()),e.not_string.test(j[8])&&e.not_json.test(j[8])&&"number"!=c(g)&&isNaN(g))throw new TypeError(b("[sprintf] expecting number but found %s",c(g)));switch(e.number.test(j[8])&&(r=g>=0),j[8]){case"b":g=g.toString(2);break;case"c":g=String.fromCharCode(g);break;case"d":case"i":g=parseInt(g,10);break;case"j":g=JSON.stringify(g,null,j[6]?parseInt(j[6]):0);break;case"e":g=j[7]?g.toExponential(j[7]):g.toExponential();break;case"f":g=j[7]?parseFloat(g).toFixed(j[7]):parseFloat(g);break;case"g":g=j[7]?parseFloat(g).toPrecision(j[7]):parseFloat(g);break;case"o":g=g.toString(8);break;case"s":g=(g=String(g))&&j[7]?g.substring(0,j[7]):g;break;case"u":g>>>=0;break;case"x":g=g.toString(16);break;case"X":g=g.toString(16).toUpperCase()}e.json.test(j[8])?q[q.length]=g:(!e.number.test(j[8])||r&&!j[3]?s="":(s=r?"+":"-",g=g.toString().replace(e.sign,"")),l=j[4]?"0"===j[4]?"0":j[4].charAt(1):" ",m=j[6]-(s+g).length,k=j[6]&&m>0?d(l,m):"",q[q.length]=j[5]?s+g+k:"0"===l?s+k+g:k+s+g)}return q.join("")},b.cache={},b.parse=function(a){for(var b=a,c=[],d=[],f=0;b;){if(null!==(c=e.text.exec(b)))d[d.length]=c[0];else if(null!==(c=e.modulo.exec(b)))d[d.length]="%";else{if(null===(c=e.placeholder.exec(b)))throw new SyntaxError("[sprintf] unexpected placeholder");if(c[2]){f|=1;var g=[],h=c[2],i=[];if(null===(i=e.key.exec(h)))throw new SyntaxError("[sprintf] failed to parse named argument key");for(g[g.length]=i[1];""!==(h=h.substring(i[0].length));)if(null!==(i=e.key_access.exec(h)))g[g.length]=i[1];else{if(null===(i=e.index_access.exec(h)))throw new SyntaxError("[sprintf] failed to parse named argument key");g[g.length]=i[1]}c[2]=g}else f|=2;if(3===f)throw new Error("[sprintf] mixing positional and named placeholders is not (yet) supported");d[d.length]=c}b=b.substring(c[0].length)}return d};var f=function(a,c,d){return d=(c||[]).slice(0),d.splice(0,0,a),b.apply(null,d)};"undefined"!=typeof exports?(exports.sprintf=b,exports.vsprintf=f):(a.sprintf=b,a.vsprintf=f,"function"==typeof define&&define.amd&&define(function(){return{sprintf:b,vsprintf:f}}))}("undefined"==typeof window?this:window);
//# sourceMappingURL=sprintf.min.map
// https://github.com/topojson/topojson Version 2.2.0. Copyright 2016 Mike Bostock.
(function(n,r){"object"==typeof exports&&"undefined"!=typeof module?r(exports):"function"==typeof define&&define.amd?define(["exports"],r):r(n.topojson=n.topojson||{})})(this,function(n){"use strict";function r(n,r,e,o){t(n,r,e),t(n,r,r+o),t(n,r+o,e)}function t(n,r,t){for(var e,o=r+(t-- -r>>1);r<o;++r,--t)e=n[r],n[r]=n[t],n[t]=e}function e(n){return(n&&U.hasOwnProperty(n.type)?U[n.type]:a)(n)}function o(n){var r=n.geometry;return null==r?n.type=null:(a(r),n.type=r.type,r.geometries?n.geometries=r.geometries:r.coordinates&&(n.coordinates=r.coordinates),r.bbox&&(n.bbox=r.bbox)),delete n.geometry,n}function a(n){return n?(z.hasOwnProperty(n.type)&&z[n.type](n),n):{type:null}}function i(n){var r,t=n[0],e=n[1];return e<t&&(r=t,t=e,e=r),t+31*e}function c(n,r){var t,e=n[0],o=n[1],a=r[0],i=r[1];return o<e&&(t=e,e=o,o=t),i<a&&(t=a,a=i,i=t),e===a&&o===i}function u(){return!0}function f(n){return n}function l(n){return null!=n.type}function s(n,r){var t=r.id,e=r.bbox,o=null==r.properties?{}:r.properties,a=h(n,r);return null==t&&null==e?{type:"Feature",properties:o,geometry:a}:null==e?{type:"Feature",id:t,properties:o,geometry:a}:{type:"Feature",id:t,bbox:e,properties:o,geometry:a}}function h(n,r){function t(n,r){r.length&&r.pop();for(var t=f[n<0?~n:n],e=0,o=t.length;e<o;++e)r.push(u(t[e].slice(),e));n<0&&Q(r,o)}function e(n){return u(n.slice())}function o(n){for(var r=[],e=0,o=n.length;e<o;++e)t(n[e],r);return r.length<2&&r.push(r[0].slice()),r}function a(n){for(var r=o(n);r.length<4;)r.push(r[0].slice());return r}function i(n){return n.map(a)}function c(n){var r,t=n.type;switch(t){case"GeometryCollection":return{type:t,geometries:n.geometries.map(c)};case"Point":r=e(n.coordinates);break;case"MultiPoint":r=n.coordinates.map(e);break;case"LineString":r=o(n.arcs);break;case"MultiLineString":r=n.arcs.map(o);break;case"Polygon":r=i(n.arcs);break;case"MultiPolygon":r=n.arcs.map(i);break;default:return null}return{type:t,coordinates:r}}var u=J(n),f=n.arcs;return c(r)}function g(n,r,t){var e,o,a;if(arguments.length>1)e=v(n,r,t);else for(o=0,e=new Array(a=n.arcs.length);o<a;++o)e[o]=o;return{type:"MultiLineString",arcs:Y(n,e)}}function v(n,r,t){function e(n){var r=n<0?~n:n;(l[r]||(l[r]=[])).push({i:n,g:u})}function o(n){n.forEach(e)}function a(n){n.forEach(o)}function i(n){n.forEach(a)}function c(n){switch(u=n,n.type){case"GeometryCollection":n.geometries.forEach(c);break;case"LineString":o(n.arcs);break;case"MultiLineString":case"Polygon":a(n.arcs);break;case"MultiPolygon":i(n.arcs)}}var u,f=[],l=[];return c(r),l.forEach(null==t?function(n){f.push(n[0].i)}:function(n){t(n[0].g,n[n.length-1].g)&&f.push(n[0].i)}),f}function p(n){for(var r,t=-1,e=n.length,o=n[e-1],a=0;++t<e;)r=o,o=n[t],a+=r[0]*o[1]-r[1]*o[0];return Math.abs(a)}function y(n,r){function t(n){switch(n.type){case"GeometryCollection":n.geometries.forEach(t);break;case"Polygon":e(n.arcs);break;case"MultiPolygon":n.arcs.forEach(e)}}function e(n){n.forEach(function(r){r.forEach(function(r){(a[r=r<0?~r:r]||(a[r]=[])).push(n)})}),i.push(n)}function o(r){return p(h(n,{type:"Polygon",arcs:[r]}).coordinates[0])}var a={},i=[],c=[];return r.forEach(t),i.forEach(function(n){if(!n._){var r=[],t=[n];for(n._=1,c.push(r);n=t.pop();)r.push(n),n.forEach(function(n){n.forEach(function(n){a[n<0?~n:n].forEach(function(n){n._||(n._=1,t.push(n))})})})}}),i.forEach(function(n){delete n._}),{type:"MultiPolygon",arcs:c.map(function(r){var t,e=[];if(r.forEach(function(n){n.forEach(function(n){n.forEach(function(n){a[n<0?~n:n].length<2&&e.push(n)})})}),e=Y(n,e),(t=e.length)>1)for(var i,c,u=1,f=o(e[0]);u<t;++u)(i=o(e[u]))>f&&(c=e[0],e[0]=e[u],e[u]=c,f=i);return e})}}function d(n){var r=n[0],t=n[1],e=n[2];return Math.abs((r[0]-e[0])*(t[1]-r[1])-(r[0]-t[0])*(e[1]-r[1]))}function m(n){for(var r,t=-1,e=n.length,o=n[e-1],a=0;++t<e;)r=o,o=n[t],a+=r[0]*o[1]-r[1]*o[0];return Math.abs(a)/2}function b(n,r){return n[1][2]-r[1][2]}function E(n,r){if(t=n.length){if((r=+r)<=0||t<2)return n[0];if(r>=1)return n[t-1];var t,e=(t-1)*r,o=Math.floor(e),a=n[o],i=n[o+1];return a+(i-a)*(e-o)}}function M(n,r){return r-n}function P(n,r){if(!n.length)return 0;var t,e,o,a,i,c,u,f=0,l=n[0],s=l[0]*gn,h=(l[1]*gn+sn)/2,g=dn(h),v=bn(h);for(i=1,c=n.length;i<c;++i)l=n[i],t=s,s=l[0]*gn,e=s-t,h=(l[1]*gn+sn)/2,o=g,g=dn(h),a=v,v=bn(h),u=a*v,f+=yn(u*bn(e),o*g+u*dn(e));return f=2*(f>ln?f-sn:f<-ln?f+sn:f),r&&(f*=-1),f<0?f+hn:f}function w(n){var r=n[0][0]*gn,t=n[0][1]*gn,e=dn(t),o=bn(t),a=n[1][0]*gn,i=n[1][1]*gn,c=dn(i),u=bn(i),f=n[2][0]*gn,l=n[2][1]*gn,s=dn(l),h=bn(l),g=k(r,e,o,a,c,u),v=k(a,c,u,f,s,h),p=k(f,s,h,r,e,o),y=(g+v+p)/2;return 4*pn(En(mn(0,Mn(y/2)*Mn((y-g)/2)*Mn((y-v)/2)*Mn((y-p)/2))))}function k(n,r,t,e,o,a){var i=vn(e-n),c=dn(i),u=bn(i),f=a*u,l=t*o-r*a*c,s=r*o+t*a*c;return yn(En(f*f+l*l),s)}var x=function(n){function r(n){n&&f.hasOwnProperty(n.type)&&f[n.type](n)}function t(n){var r=n[0],t=n[1];r<a&&(a=r),r>c&&(c=r),t<i&&(i=t),t>u&&(u=t)}function e(n){n.forEach(t)}function o(n){n.forEach(e)}var a=1/0,i=1/0,c=-(1/0),u=-(1/0),f={GeometryCollection:function(n){n.geometries.forEach(r)},Point:function(n){t(n.coordinates)},MultiPoint:function(n){n.coordinates.forEach(t)},LineString:function(n){e(n.coordinates)},MultiLineString:function(n){n.coordinates.forEach(e)},Polygon:function(n){n.coordinates.forEach(e)},MultiPolygon:function(n){n.coordinates.forEach(o)}};for(var l in n)r(n[l]);return c>=a&&u>=i?[a,i,c,u]:void 0},A=function(n,r,t,e,o){function a(e){for(var a=r(e)&f,i=u[a],c=0;i!=o;){if(t(i,e))return!0;if(++c>=n)throw new Error("full hashset");i=u[a=a+1&f]}return u[a]=e,!0}function i(e){for(var a=r(e)&f,i=u[a],c=0;i!=o;){if(t(i,e))return!0;if(++c>=n)break;i=u[a=a+1&f]}return!1}function c(){for(var n=[],r=0,t=u.length;r<t;++r){var e=u[r];e!=o&&n.push(e)}return n}3===arguments.length&&(e=Array,o=null);for(var u=new e(n=1<<Math.max(4,Math.ceil(Math.log(n)/Math.LN2))),f=n-1,l=0;l<n;++l)u[l]=o;return{add:a,has:i,values:c}},L=function(n,r,t,e,o,a){function i(e,a){for(var i=r(e)&h,c=l[i],u=0;c!=o;){if(t(c,e))return s[i]=a;if(++u>=n)throw new Error("full hashmap");c=l[i=i+1&h]}return l[i]=e,s[i]=a,a}function c(e,a){for(var i=r(e)&h,c=l[i],u=0;c!=o;){if(t(c,e))return s[i];if(++u>=n)throw new Error("full hashmap");c=l[i=i+1&h]}return l[i]=e,s[i]=a,a}function u(e,a){for(var i=r(e)&h,c=l[i],u=0;c!=o;){if(t(c,e))return s[i];if(++u>=n)break;c=l[i=i+1&h]}return a}function f(){for(var n=[],r=0,t=l.length;r<t;++r){var e=l[r];e!=o&&n.push(e)}return n}3===arguments.length&&(e=a=Array,o=null);for(var l=new e(n=1<<Math.max(4,Math.ceil(Math.log(n)/Math.LN2))),s=new a(n),h=n-1,g=0;g<n;++g)l[g]=o;return{set:i,maybeSet:c,get:u,keys:f}},S=function(n,r){return n[0]===r[0]&&n[1]===r[1]},C=new ArrayBuffer(16),_=new Float64Array(C),j=new Uint32Array(C),G=function(n){_[0]=n[0],_[1]=n[1];var r=j[0]^j[1];return r=r<<5^r>>7^j[2]^j[3],2147483647&r},I=function(n){function r(n,r,t,e){if(v[t]!==n){v[t]=n;var o=p[t];if(o>=0){var a=y[t];o===r&&a===e||o===e&&a===r||(++m,d[t]=1)}else p[t]=r,y[t]=e}}function t(){for(var n=L(1.4*l.length,e,o,Int32Array,-1,Int32Array),r=new Int32Array(l.length),t=0,a=l.length;t<a;++t)r[t]=n.maybeSet(t,t);return r}function e(n){return G(l[n])}function o(n,r){return S(l[n],l[r])}var a,i,c,u,f,l=n.coordinates,s=n.lines,h=n.rings,g=t(),v=new Int32Array(l.length),p=new Int32Array(l.length),y=new Int32Array(l.length),d=new Int8Array(l.length),m=0;for(a=0,i=l.length;a<i;++a)v[a]=p[a]=y[a]=-1;for(a=0,i=s.length;a<i;++a){var b=s[a],E=b[0],M=b[1];for(u=g[E],f=g[++E],++m,d[u]=1;++E<=M;)r(a,c=u,u=f,f=g[E]);++m,d[f]=1}for(a=0,i=l.length;a<i;++a)v[a]=-1;for(a=0,i=h.length;a<i;++a){var P=h[a],w=P[0]+1,k=P[1];for(c=g[k-1],u=g[w-1],f=g[w],r(a,c,u,f);++w<=k;)r(a,c=u,u=f,f=g[w])}v=p=y=null;var x,C=A(1.4*m,G,S);for(a=0,i=l.length;a<i;++a)d[x=g[a]]&&C.add(l[x]);return C},F=function(n){var t,e,o,a=I(n),i=n.coordinates,c=n.lines,u=n.rings;for(e=0,o=c.length;e<o;++e)for(var f=c[e],l=f[0],s=f[1];++l<s;)a.has(i[l])&&(t={0:l,1:f[1]},f[1]=l,f=f.next=t);for(e=0,o=u.length;e<o;++e)for(var h=u[e],g=h[0],v=g,p=h[1],y=a.has(i[g]);++v<p;)a.has(i[v])&&(y?(t={0:v,1:h[1]},h[1]=v,h=h.next=t):(r(i,g,p,p-v),i[p]=i[g],y=!0,v=g));return n},O=function(n){function r(n){var r,t,a,i,c,u,f,l;if(a=y.get(r=h[n[0]]))for(f=0,l=a.length;f<l;++f)if(i=a[f],e(i,n))return n[0]=i[0],void(n[1]=i[1]);if(c=y.get(t=h[n[1]]))for(f=0,l=c.length;f<l;++f)if(u=c[f],o(u,n))return n[1]=u[0],void(n[0]=u[1]);a?a.push(n):y.set(r,[n]),c?c.push(n):y.set(t,[n]),d.push(n)}function t(n){var r,t,e,o,u;if(t=y.get(r=h[n[0]]))for(o=0,u=t.length;o<u;++o){if(e=t[o],a(e,n))return n[0]=e[0],void(n[1]=e[1]);if(i(e,n))return n[0]=e[1],void(n[1]=e[0])}if(t=y.get(r=h[n[0]+c(n)]))for(o=0,u=t.length;o<u;++o){if(e=t[o],a(e,n))return n[0]=e[0],void(n[1]=e[1]);if(i(e,n))return n[0]=e[1],void(n[1]=e[0])}t?t.push(n):y.set(r,[n]),d.push(n)}function e(n,r){var t=n[0],e=r[0],o=n[1],a=r[1];if(t-o!==e-a)return!1;for(;t<=o;++t,++e)if(!S(h[t],h[e]))return!1;return!0}function o(n,r){var t=n[0],e=r[0],o=n[1],a=r[1];if(t-o!==e-a)return!1;for(;t<=o;++t,--a)if(!S(h[t],h[a]))return!1;return!0}function a(n,r){var t=n[0],e=r[0],o=n[1],a=r[1],i=o-t;if(i!==a-e)return!1;for(var u=c(n),f=c(r),l=0;l<i;++l)if(!S(h[t+(l+u)%i],h[e+(l+f)%i]))return!1;return!0}function i(n,r){var t=n[0],e=r[0],o=n[1],a=r[1],i=o-t;if(i!==a-e)return!1;for(var u=c(n),f=i-c(r),l=0;l<i;++l)if(!S(h[t+(l+u)%i],h[a-(l+f)%i]))return!1;return!0}function c(n){for(var r=n[0],t=n[1],e=r,o=e,a=h[e];++e<t;){var i=h[e];(i[0]<a[0]||i[0]===a[0]&&i[1]<a[1])&&(o=e,a=i)}return o-r}var u,f,l,s,h=n.coordinates,g=n.lines,v=n.rings,p=g.length+v.length;for(delete n.lines,delete n.rings,l=0,s=g.length;l<s;++l)for(u=g[l];u=u.next;)++p;for(l=0,s=v.length;l<s;++l)for(f=v[l];f=f.next;)++p;var y=L(2*p*1.4,G,S),d=n.arcs=[];for(l=0,s=g.length;l<s;++l){u=g[l];do r(u);while(u=u.next)}for(l=0,s=v.length;l<s;++l)if(f=v[l],f.next){do r(f);while(f=f.next)}else t(f);return n},N=function(n){for(var r=n.arcs,t=-1,e=r.length;++t<e;)for(var o,a,i=r[t],c=0,u=i.length,f=i[0],l=f[0],s=f[1];++c<u;)f=i[c],o=f[0],a=f[1],i[c]=[o-l,a-s],l=o,s=a;return n},q=function(n){function r(n){n&&f.hasOwnProperty(n.type)&&f[n.type](n)}function t(n){for(var r=0,t=n.length;r<t;++r)u[++a]=n[r];var e={0:a-t+1,1:a};return i.push(e),e}function e(n){for(var r=0,t=n.length;r<t;++r)u[++a]=n[r];var e={0:a-t+1,1:a};return c.push(e),e}function o(n){return n.map(e)}var a=-1,i=[],c=[],u=[],f={GeometryCollection:function(n){n.geometries.forEach(r)},LineString:function(n){n.arcs=t(n.coordinates),delete n.coordinates},MultiLineString:function(n){n.arcs=n.coordinates.map(t),delete n.coordinates},Polygon:function(n){n.arcs=n.coordinates.map(e),delete n.coordinates},MultiPolygon:function(n){n.arcs=n.coordinates.map(o),delete n.coordinates}};for(var l in n)r(n[l]);return{type:"Topology",coordinates:u,lines:i,rings:c,objects:n}},T=function(n){var r;for(r in n)n[r]=e(n[r]);return n},U={Feature:o,FeatureCollection:function(n){return n.type="GeometryCollection",n.geometries=n.features,n.features.forEach(o),delete n.features,n}},z={GeometryCollection:function(n){for(var r=n.geometries,t=-1,e=r.length;++t<e;)r[t]=a(r[t])},MultiPoint:function(n){n.coordinates.length?n.coordinates.length<2&&(n.type="Point",n.coordinates=n.coordinates[0]):(n.type=null,delete n.coordinates)},LineString:function(n){n.coordinates.length||(n.type=null,delete n.coordinates)},MultiLineString:function(n){for(var r=n.coordinates,t=0,e=0,o=r.length;t<o;++t){var a=r[t];a.length&&(r[e++]=a)}e?e<2?(n.type="LineString",n.coordinates=r[0]):n.coordinates.length=e:(n.type=null,delete n.coordinates)},Polygon:function(n){for(var r=n.coordinates,t=0,e=0,o=r.length;t<o;++t){var a=r[t];a.length&&(r[e++]=a)}e?n.coordinates.length=e:(n.type=null,delete n.coordinates)},MultiPolygon:function(n){for(var r=n.coordinates,t=0,e=0,o=r.length;t<o;++t){for(var a=r[t],i=0,c=0,u=a.length;i<u;++i){var f=a[i];f.length&&(a[c++]=f)}c&&(a.length=c,r[e++]=a)}e?e<2?(n.type="Polygon",n.coordinates=r[0]):r.length=e:(n.type=null,delete n.coordinates)}},R=function(n,r,t){function e(n){return n[0]=Math.round((n[0]-i)*l),n[1]=Math.round((n[1]-c)*s),n}function o(n){for(var r,t,o,a=0,i=1,c=n.length,u=e(n[0]),f=u[0],l=u[1];++a<c;)u=e(n[a]),t=u[0],o=u[1],t===f&&o===l||(r=n[i++],r[0]=f=t,r[1]=l=o);n.length=i}function a(n){n&&h.hasOwnProperty(n.type)&&h[n.type](n)}var i=r[0],c=r[1],u=r[2],f=r[3],l=u-i?(t-1)/(u-i):1,s=f-c?(t-1)/(f-c):1,h={GeometryCollection:function(n){n.geometries.forEach(a)},Point:function(n){e(n.coordinates)},MultiPoint:function(n){n.coordinates.forEach(e)},LineString:function(n){var r=n.coordinates;o(r),r.length<2&&(r[1]=r[0])},MultiLineString:function(n){for(var r=n.coordinates,t=0,e=r.length;t<e;++t){var a=r[t];o(a),a.length<2&&(a[1]=a[0])}},Polygon:function(n){for(var r=n.coordinates,t=0,e=r.length;t<e;++t){var a=r[t];for(o(a);a.length<4;)a.push(a[0])}},MultiPolygon:function(n){for(var r=n.coordinates,t=0,e=r.length;t<e;++t)for(var a=r[t],i=0,c=a.length;i<c;++i){var u=a[i];for(o(u);u.length<4;)u.push(u[0])}}};for(var g in n)a(n[g]);return{scale:[1/l,1/s],translate:[i,c]}},V=function(n,r){function t(n){n&&h.hasOwnProperty(n.type)&&h[n.type](n)}function e(n){var r=[];do{var t=s.get(n);r.push(n[0]<n[1]?t:~t)}while(n=n.next);return r}function o(n){return n.map(e)}var a=x(T(n)),u=r>0&&a&&R(n,a,r),f=O(F(q(n))),l=f.coordinates,s=L(1.4*f.arcs.length,i,c);n=f.objects,f.bbox=a,f.arcs=f.arcs.map(function(n,r){return s.set(n,r),l.slice(n[0],n[1]+1)}),delete f.coordinates,l=null;var h={GeometryCollection:function(n){n.geometries.forEach(t)},LineString:function(n){n.arcs=e(n.arcs)},MultiLineString:function(n){n.arcs=n.arcs.map(e)},Polygon:function(n){n.arcs=n.arcs.map(e)},MultiPolygon:function(n){n.arcs=n.arcs.map(o)}};for(var g in n)t(n[g]);return u&&(f.transform=u,N(f)),f},B=function(n){function r(n){switch(n.type){case"GeometryCollection":n.geometries.forEach(r);break;case"LineString":t(n.arcs);break;case"MultiLineString":n.arcs.forEach(t);break;case"Polygon":n.arcs.forEach(t);break;case"MultiPolygon":n.arcs.forEach(e)}}function t(n){for(var r=0,t=n.length;r<t;++r){var e,o=n[r],f=o<0&&(o=~o,!0);null==(e=u[o])&&(u[o]=e=++c,i[e]=a[o]),n[r]=f?~e:e}}function e(n){n.forEach(t)}var o,a=n.arcs,i=n.arcs=[],c=-1,u=new Array(a.length);for(o in n.objects)r(n.objects[o]);return n},W=function(n,r){function t(n){switch(n.type){case"Polygon":n.arcs=e(n.arcs),n.arcs||(n.type=null,delete n.arcs);break;case"MultiPolygon":n.arcs=n.arcs.map(e).filter(f),n.arcs.length||(n.type=null,delete n.arcs);break;case"GeometryCollection":n.geometries.forEach(t),n.geometries=n.geometries.filter(l),n.geometries.length||(n.type=null,delete n.geometries)}}function e(n){return n.length&&o(n[0])?[n.shift()].concat(n.filter(a)):null}function o(n){return r(n,!1)}function a(n){return r(n,!0)}var i;null==r&&(r=u);for(i in n.objects)t(n.objects[i]);return B(n)},D=function(n){function r(n){switch(n.type){case"GeometryCollection":n.geometries.forEach(r);break;case"Polygon":t(n.arcs);break;case"MultiPolygon":n.arcs.forEach(t)}}function t(n){for(var r=0,t=n.length;r<t;++r,++a)for(var e=n[r],i=0,c=e.length;i<c;++i){var u=e[i];u<0&&(u=~u);var f=o[u];f>=0&&f!==a?o[u]=-1:o[u]=a}}var e,o={},a=0;for(e in n.objects)r(n.objects[e]);return function(n){for(var r,t=0,e=n.length;t<e;++t)if(r=n[t],o[r<0?~r:r]<0)return!0;return!1}},H=function(n){return n},J=function(n){if(null==(r=n.transform))return H;var r,t,e,o=r.scale[0],a=r.scale[1],i=r.translate[0],c=r.translate[1];return function(n,r){return r||(t=e=0),n[0]=(t+=n[0])*o+i,n[1]=(e+=n[1])*a+c,n}},K=function(n){function r(n){c[0]=n[0],c[1]=n[1],i(c),c[0]<u&&(u=c[0]),c[0]>l&&(l=c[0]),c[1]<f&&(f=c[1]),c[1]>s&&(s=c[1])}function t(n){switch(n.type){case"GeometryCollection":n.geometries.forEach(t);break;case"Point":r(n.coordinates);break;case"MultiPoint":n.coordinates.forEach(r)}}var e=n.bbox;if(!e){var o,a,i=J(n),c=new Array(2),u=1/0,f=u,l=-u,s=-u;n.arcs.forEach(function(n){for(var r=-1,t=n.length;++r<t;)o=n[r],c[0]=o[0],c[1]=o[1],i(c,r),c[0]<u&&(u=c[0]),c[0]>l&&(l=c[0]),c[1]<f&&(f=c[1]),c[1]>s&&(s=c[1])});for(a in n.objects)t(n.objects[a]);e=n.bbox=[u,f,l,s]}return e},Q=function(n,r){for(var t,e=n.length,o=e-r;o<--e;)t=n[o],n[o++]=n[e],n[e]=t},X=function(n,r){return"GeometryCollection"===r.type?{type:"FeatureCollection",features:r.geometries.map(function(r){return s(n,r)})}:s(n,r)},Y=function(n,r){function t(r){var t,e=n.arcs[r<0?~r:r],o=e[0];return n.transform?(t=[0,0],e.forEach(function(n){t[0]+=n[0],t[1]+=n[1]})):t=e[e.length-1],r<0?[t,o]:[o,t]}function e(n,r){for(var t in n){var e=n[t];delete r[e.start],delete e.start,delete e.end,e.forEach(function(n){o[n<0?~n:n]=1}),c.push(e)}}var o={},a={},i={},c=[],u=-1;return r.forEach(function(t,e){var o,a=n.arcs[t<0?~t:t];a.length<3&&!a[1][0]&&!a[1][1]&&(o=r[++u],r[u]=t,r[e]=o)}),r.forEach(function(n){var r,e,o=t(n),c=o[0],u=o[1];if(r=i[c])if(delete i[r.end],r.push(n),r.end=u,e=a[u]){delete a[e.start];var f=e===r?r:r.concat(e);a[f.start=r.start]=i[f.end=e.end]=f}else a[r.start]=i[r.end]=r;else if(r=a[u])if(delete a[r.start],r.unshift(n),r.start=c,e=i[c]){delete i[e.end];var l=e===r?r:e.concat(r);a[l.start=e.start]=i[l.end=r.end]=l}else a[r.start]=i[r.end]=r;else r=[n],a[r.start=c]=i[r.end=u]=r}),e(i,a),e(a,i),r.forEach(function(n){o[n<0?~n:n]||c.push([n])}),c},Z=function(n){return h(n,g.apply(this,arguments))},$=function(n){return h(n,y.apply(this,arguments))},nn=function(n,r){for(var t=0,e=n.length;t<e;){var o=t+e>>>1;n[o]<r?t=o+1:e=o}return t},rn=function(n){function r(n,r){n.forEach(function(n){n<0&&(n=~n);var t=o[n];t?t.push(r):o[n]=[r]})}function t(n,t){n.forEach(function(n){r(n,t)})}function e(n,r){"GeometryCollection"===n.type?n.geometries.forEach(function(n){e(n,r)}):n.type in i&&i[n.type](n.arcs,r)}var o={},a=n.map(function(){return[]}),i={LineString:r,MultiLineString:t,Polygon:t,MultiPolygon:function(n,r){n.forEach(function(n){t(n,r)})}};n.forEach(e);for(var c in o)for(var u=o[c],f=u.length,l=0;l<f;++l)for(var s=l+1;s<f;++s){var h,g=u[l],v=u[s];(h=a[g])[c=nn(h,v)]!==v&&h.splice(c,0,v),(h=a[v])[c=nn(h,g)]!==g&&h.splice(c,0,g)}return a},tn=function(n,r){function t(n){n[0]=Math.round((n[0]-i)/c),n[1]=Math.round((n[1]-u)/f)}function e(n){switch(n.type){case"GeometryCollection":n.geometries.forEach(e);break;case"Point":t(n.coordinates);break;case"MultiPoint":n.coordinates.forEach(t)}}if(!((r=Math.floor(r))>=2))throw new Error("n must be ≥2");if(n.transform)throw new Error("already quantized");var o,a=K(n),i=a[0],c=(a[2]-i)/(r-1)||1,u=a[1],f=(a[3]-u)/(r-1)||1;n.arcs.forEach(function(n){for(var r,t,e,o=1,a=1,l=n.length,s=n[0],h=s[0]=Math.round((s[0]-i)/c),g=s[1]=Math.round((s[1]-u)/f);o<l;++o)s=n[o],t=Math.round((s[0]-i)/c),e=Math.round((s[1]-u)/f),t===h&&e===g||(r=n[a++],r[0]=t-h,h=t,r[1]=e-g,g=e);a<2&&(r=n[a++],r[0]=0,r[1]=0),n.length=a});for(o in n.objects)e(n.objects[o]);return n.transform={scale:[c,f],translate:[i,u]},n},en=function(n){if(null==(r=n.transform))return H;var r,t,e,o=r.scale[0],a=r.scale[1],i=r.translate[0],c=r.translate[1];return function(n,r){r||(t=e=0);var u=Math.round((n[0]-i)/o),f=Math.round((n[1]-c)/a);return n[0]=u-t,t=u,n[1]=f-e,e=f,n}},on=function(n,r,t){return r=null==r?Number.MIN_VALUE:+r,null==t&&(t=m),function(e,o){return t(X(n,{type:"Polygon",arcs:[e]}).geometry.coordinates[0],o)>=r}},an=function(){function n(n,r){for(;r>0;){var t=(r+1>>1)-1,o=e[t];if(b(n,o)>=0)break;e[o._=r]=o,e[n._=r=t]=n}}function r(n,r){for(;;){var t=r+1<<1,a=t-1,i=r,c=e[i];if(a<o&&b(e[a],c)<0&&(c=e[i=a]),t<o&&b(e[t],c)<0&&(c=e[i=t]),i===r)break;e[c._=r]=c,e[n._=r=i]=n}}var t={},e=[],o=0;return t.push=function(r){return n(e[r._=o]=r,o++),o},t.pop=function(){if(!(o<=0)){var n,t=e[0];return--o>0&&(n=e[o],r(e[n._=0]=n,0)),t}},t.remove=function(t){var a,i=t._;if(e[i]===t)return i!==--o&&(a=e[o],(b(a,t)<0?n:r)(e[a._=i]=a,i)),i},t},cn=function(n,r){function t(n){a.remove(n),n[1][2]=r(n),a.push(n)}var e=J(n),o=en(n),a=an();return null==r&&(r=d),n.arcs.forEach(function(n){var i,c,u,f=[],l=0;for(n.forEach(e),c=1,u=n.length-1;c<u;++c)i=n.slice(c-1,c+2),i[1][2]=r(i),f.push(i),a.push(i);for(n[0][2]=n[u][2]=1/0,c=0,u=f.length;c<u;++c)i=f[c],i.previous=f[c-1],i.next=f[c+1];for(;i=a.pop();){var s=i.previous,h=i.next;i[1][2]<l?i[1][2]=l:l=i[1][2],s&&(s.next=h,s[2]=i[2],t(s)),h&&(h.previous=s,h[0]=i[0],t(h))}n.forEach(o)}),n},un=function(n,r){var t=[];return n.arcs.forEach(function(n){n.forEach(function(n){isFinite(n[2])&&t.push(n[2])})}),t.length&&E(t.sort(M),r)},fn=function(n,r){return r=null==r?Number.MIN_VALUE:+r,n.arcs.forEach(n.transform?function(n){for(var t,e,o=0,a=0,i=-1,c=-1,u=n.length;++i<u;)t=n[i],t[2]>=r?(e=n[++c],e[0]=t[0]+o,e[1]=t[1]+a,o=a=0):(o+=t[0],a+=t[1]);n.length=++c}:function(n){for(var t,e=-1,o=-1,a=n.length;++e<a;)t=n[e],t[2]>=r&&(n[++o]=t);n.length=++o}),n.arcs.forEach(n.transform?function(n){var r=0,t=0,e=n.length,o=n[0];for(o.length=2;++r<e;)o=n[r],o.length=2,(o[0]||o[1])&&(n[++t]=o);n.length=(t||1)+1}:function(n){var r,t,e=0,o=0,a=n.length,i=n[0],c=i[0],u=i[1];for(i.length=2;++e<a;)i=n[e],r=i[0],t=i[1],i.length=2,c===r&&u===t||(n[++o]=i,c=r,u=t);n.length=(o||1)+1}),n},ln=Math.PI,sn=2*ln,hn=4*ln,gn=ln/180,vn=Math.abs,pn=Math.atan,yn=Math.atan2,dn=Math.cos,mn=Math.max,bn=Math.sin,En=Math.sqrt,Mn=Math.tan;n.topology=V,n.filter=W,n.filterAttached=D,n.filterWeight=on,n.planarRingArea=m,n.planarTriangleArea=d,n.presimplify=cn,n.quantile=un,n.simplify=fn,n.sphericalRingArea=P,n.sphericalTriangleArea=w,n.bbox=K,n.feature=X,n.merge=$,n.mergeArcs=y,n.mesh=Z,n.meshArcs=g,n.neighbors=rn,n.quantize=tn,n.transform=J,n.untransform=en,Object.defineProperty(n,"__esModule",{value:!0})});
(function(window){
    function PropertyFormatter(input) {
        //"%s[: %s]", A, B
        var parts = input.split(',').map(function(s){return s.trim();}),
            fmt = parts[0],
            keys = parts.slice(1),
            re = /(\[*?[^%]*?%[a-z0-9\.]+[^%]*?\]?)/g,
            reOut,
            fmts = [];
        debug('fmt "%s"',fmt);
        debug('keys = %s',keys);
        var nextLast;
        while((reOut = re.exec(fmt)) !== null) {
            debug('%j',reOut);
            fmts.push(reOut[1]);
            nextLast = re.lastIndex;
        }
        debug('%d,%d',fmt.length,nextLast);
        if(fmt.length > nextLast) {
            // last match excluded some text on the end of the string, append that to the last fmt
            fmts[fmts.length-1] += fmt.substring(nextLast);
        }
        fmts = fmts.map(function(p){
            return /^\[.*\]$/.test(p) ? {
                fmt: p.slice(1,p.length-1),
                opt: true,
            } : {
                fmt: p
            };
        });
        fmts.forEach(function(p,i){debug('[%d] = "%j"',i,p);});
        if(fmts.length !== keys.length) {
            throw new Error('format to key length mismatch');
        }
        this.$keys = keys;
        this.$fmts = fmts;
    }

    PropertyFormatter.prototype.format = function(properties) {
        var keys = this.$keys,
            fmts = this.$fmts,
            fmt = keys.reduce(function(f,key,i){
                var v = properties[key],
                    nov = v === null || typeof(v) === 'undefined',
                    fmt = fmts[i];
                if(nov && !fmt.opt) {
                    throw new Error('missing required key '+key);
                }
                if(!nov) {
                    f.fmt += fmt.fmt;
                    f.args.push(v);
                }
                return f;
            },{
                fmt: '',
                args: []
            });
        debug('%j',fmt);
        return formatter.apply(null,[fmt.fmt].concat(fmt.args));
    };

    var debug,formatter;
    if(typeof(module) !== 'undefined' && module.exports) {
        module.exports = PropertyFormatter;
        debug = require('debug')('property-formatter');
        formatter = require('sprintf-js').sprintf;
    } else if(typeof(window) !== 'undefined'){
        window.PropertyFormatter = PropertyFormatter;
        debug = function(){};
        formatter = window.sprintf; // must be included by browser client
    }
})(typeof(window) === 'undefined' ? this : window);

angular.module('app-container-geo.admin',[
    'app-container-file'
])
.directive('propertyFormatValidate',['$log','$q','$parse','$window',function($log,$q,$parse,$window){
    return {
        require: 'ngModel',
        link: function($scope,$element,$attrs,$ctrl){
            var PropertyFormatter = $window.PropertyFormatter,
                exampleProperties = $parse($attrs.propertyFormatValidate)($scope);
            $log.debug('propertyFormatValidate.exampleProperties',exampleProperties);
            if(exampleProperties) {
                $ctrl.$asyncValidators[$attrs.ngModel.replace('.','_')+'_propertyFormat'] = function(modelValue,newValue) {
                    $log.debug('modelValue="'+modelValue+'" newValue="'+newValue+'"');
                    var def = $q.defer(),fmt;
                    if(newValue) {
                        try {
                            fmt = (new PropertyFormatter(newValue)).format(exampleProperties);
                            $log.debug('format string ok',fmt);
                            def.resolve(true);
                        } catch(err) {
                            $log.debug('format error',err);
                            def.reject();
                        }
                    } else {
                        def.reject(); // required so OK
                    }
                    return def.promise;
                };
            }
        }
    };
}])
.directive('layerNameValidate',['$log','$q','$timeout','Layer',function($log,$q,$timeout,Layer){
    return {
        require: 'ngModel',
        link: function($scope,$element,$attrs,$ctrl){
            var $t_promise;
            $ctrl.$asyncValidators['layerNameinUse'] = function(modelValue,newValue) {
                $log.debug('modelValue="'+modelValue+'" newValue="'+newValue+'"');
                if($t_promise) {
                    $timeout.cancel($t_promise);
                    $t_promise = undefined;
                }
                var def = $q.defer();
                if(newValue) {
                    // only fire after 1/2 sec to avoid lots of beating on
                    // the server
                    $t_promise = $timeout(function(){
                        Layer.query({
                            $filter: 'name eq \''+newValue+'\''
                        },function(layers){
                            if(layers.list.length === 0) {
                                def.resolve(true);
                            } else {
                                def.reject();
                            }
                        });
                    },500);
                } else {
                    def.reject(); // required so OK
                }
                return def.promise;
            };
        }
    };
}])
.directive('layerCreateInputForm',[function(){
    return {
        restrict: 'C',
        templateUrl: 'js/admin/layer-create-input-form.html'
    };
}])
.directive('exampleLayerProperties',[function(){
    return {
        restrict: 'AEC',
        template: '<h4>Example Feature Properties '+
        '<i uib-popover-template="\'js/admin/layer-create-eprops-popover.html\'" '+
        'popover-placement="auto bottom" '+
        'class="fa fa-info-circle" aria-hidden="true"></i>'+
        '</h4><table class="table table-striped table-condensed">'+
        '<tr><th>Property</th><th>Value</th><th>Type</th><th></th></tr>'+
        '<tr ng-repeat="(prop,pinfo) in preResults.examplePropertiesAnnotated">'+
        '<td>{{prop}}</td><td>{{pinfo.value}}</td><td>{{pinfo.type}}</td>'+
        '<td><i uib-tooltip="Unique" ng-if="pinfo.unique" class="fa fa-key" aria-hidden="true"></i></td>'+
        '</tr>'+
        '</table>'
    };
}])
.controller('LayerCreateCtrl',['$scope','$log','$timeout','$uibModalInstance','WebSocketConnection','File','NotificationService',function($scope,$log,$timeout,$uibModalInstance,WebSocketConnection,File,NotificationService) {
    var STATES = $scope.STATES = {
        HANDSHAKE: 'HANDSHAKE',
        FILE_UPLOAD: 'FILE_UPLOAD',
        PRE_PROCESS_RUNNING: 'PRE_PROCESS_RUNNING',
        USER_INPUT: 'USER_INPUT',
        COMPLETE: 'COMPLETE'
    },
    STATE,
    STATE_DATA;
    $scope.infoMessages = [];

    $scope.dismiss = function() {
        function goaway() {
            $uibModalInstance.dismiss();
        }
        if($scope.uploadedFile) {
            // cleanup, they're dismissing
            $log.debug('dismiss, cleaning up',$scope.uploadedFile);
            $scope.uploadedFile.$remove({id: $scope.uploadedFile._id},goaway,NotificationService.addError);
        } else {
            goaway();
        }
    };

    var wsc = new WebSocketConnection('geo/initLayer',function(){
        $log.debug('connection to geo/initLayer established.');
        $scope.$on('$destroy',wsc.connectionCloser());
        wsc.onMessage(function(msg){
            $scope.$apply(function(){
                $log.debug('Message (current state:'+STATE+')',msg);
                switch(msg.key) {
                    case 'state':
                        STATE = $scope.STATE = STATES[msg.toState];
                        STATE_DATA = $scope.STATE_DATA = msg.data;
                        break;
                    case 'error':
                        $log.error(msg.data);
                        break;
                    case 'info':
                        $log.debug('info: ',msg.data);
                        $scope.infoMessages.push(msg.data);
                        break;
                    case 'complete':
                        break;
                    default:
                        $log.error('unexpected message');
                        break;
                }
            });
        });
        $timeout(function(){
             STATE = $scope.STATE = STATES.HANDSHAKE;
        },1000);
    });

    $scope.$watch('STATE',function(state){
        if(state) {
            $log.debug('Entered state ',state);
            switch(state) {
                case STATES.HANDSHAKE:
                    wsc.send({key:'state',currentState: STATES.HANDSHAKE});
                    break;
                case STATES.USER_INPUT:
                    $scope.preResults = STATE_DATA;
                    $scope.userInput = {

                    };
                    break;
                case STATES.COMPLETE:
                    $timeout(function(){
                        $uibModalInstance.close();
                    },2000);
                    break;
            }
        }
    });

    $scope.fileResource = File;
    $scope.$watch('fileToUpload',function(file) {
        console.log('fileToUpload',file);
        if(file && file.file && file.$save) {
            file.metadata = {
                type: 'layerSource'
            };
            file.$save(function(f){
                $scope.uploadedFile = f;
                delete $scope.fileToUpload;
            });
        }
    });
    $scope.$watch('uploadedFile',function(file){
        if(file) {
            $log.debug('uploadedFile',file);
            if(file.contentType !== 'application/zip') {
                $log.debug('File is not a zip, deleting.');
                NotificationService.addError({statusText: file.fileName+' is not a zip file.'});
                file.$remove({id: file._id},function(){
                    $log.debug('removed '+file.fileName);
                    delete $scope.uploadedFile;
                },NotificationService.addError);
            } else {
                $log.debug('Notifying server of new file, start pre-processing');
                wsc.send({key:'state',currentState:STATE,data:file._id});
            }
        }
    });

    $scope.add = function() {
        wsc.send({key:'state',currentState:STATE,data:$scope.userInput});
    };

}])
.directive('layerAdmin',['$log','Layer','NotificationService','DialogService','$uibModal','PaneStateService',function($log,Layer,NotificationService,DialogService,$uibModal,PaneStateService){
    return {
        restrict: 'E',
        templateUrl: 'js/admin/layer-admin.html',
        scope: {},
        link: function($scope,$element,$attrs) {
            $scope.isPaneActive = PaneStateService.isActive;
            function listLayers() {
                $scope.layers = Layer.query({});
            }
            listLayers();
            $scope.createLayer = function() {
                $uibModal.open({
                    templateUrl: 'js/admin/layer-create.html',
                    controller: 'LayerCreateCtrl',
                    windowClass: 'layer-create',
                    size: 'lg',
                    backdrop: 'static',
                    keyboard: false
                }).result.then(function(){
                    $log.debug('layer creation dialog ok');
                    listLayers();
                });
            };
            $scope.removeLayer = function(l) {
                DialogService.confirm({
                    question: 'Are you sure you want to delete '+l.name+'?',
                    warning: 'This cannot be undone.'
                }).then(function(){
                    l.$remove({id: l._id},function(){
                        NotificationService.addInfo('Removed '+l.name);
                        listLayers();
                    },NotificationService.addError);
                });
            };
        }
    };
}])
.directive('layerAdminMap',['$log','uiGmapGoogleMapApi','uiGmapIsReady','MapLayerService',function($log,uiGmapGoogleMapApi,uiGmapIsReady,MapLayerService){
    return {
        restrict: 'C',
        template:'<ui-gmap-google-map ng-if="map" center="map.center" zoom="map.zoom" options="map.options" events="map.events">'+
        '<ui-gmap-marker ng-if="marker" coords="marker.coords" options="marker.options" events="marker.events" idkey="marker.id"></ui-gmap-marker>'+
        '</ui-gmap-google-map>',
        scope: {
            layer: '='
        },
        link: function($scope,$elm,$attrs) {
            uiGmapGoogleMapApi.then(function(google_maps){
                $scope.map = {
                    center: { latitude: 41.135760, longitude: -99.157679 },
                    zoom: 4,
                    options: {
                        scrollwheel: false,
                        streetViewControl: false,
                        mapTypeControl: false,
                        mapTypeId: google_maps.MapTypeId.HYBRID,
                        panControl: false,
                        zoomControl: true,
                        disableDoubleClickZoom: true,
                        zoomControlOptions: {
                            style: google_maps.ZoomControlStyle.SMALL,
                            position: google_maps.ControlPosition.RIGHT_TOP
                        }
                    }/*,
                    events : {
                        dblclick: function(map,eventName,args) {
                            var latLng = args[0].latLng,
                                lat = latLng.lat(),
                                lng = latLng.lng(),i;
                            $log.debug('dblclick:['+lat+','+lng+']');
                            if($scope.currentMapLayer) {
                                $scope.currentMapLayer.remove();
                            }
                            delete $scope.currentMapLayer;
                            delete $scope.currentFeatures;
                            $scope.marker = {
                                id: markerIndex++,
                                coords: {
                                    latitude: lat,
                                    longitude: lng
                                },
                                events: {
                                    'click': function() {
                                        $log.debug('marker click');
                                        //DialogService.buildConservationPlan($scope.currentMapLayer);
                                    }
                                }
                            };
                            $scope.featureProperties = [];
                            MapLayerService.getForPoint(lat,lng).then(layerSetter(map));
                        }
                    }*/
                };
                // ISSUE #1 : the 2 below is unfortunate.  for some reason that, after
                // a great deal of debugging, i was unable to determine this directive
                // gets loaded twice when its pane is opened, this means that the
                // underlying code believes there should be two maps (presumably the
                // first is discarded).
                // this MUST be fixed because the result is two promises get fired
                // and as a result the layer contents are fetched from the server
                // twice...
                // ISSUE #2 : each pane only works the first time it is opened, not the
                // second...
                uiGmapIsReady.promise(2).then(function(instances){
                    var map = instances[1].map;
                    map.data.addListener('mouseover',function(event){
                        map.data.overrideStyle(event.feature, {strokeWeight: 3});
                    });
                    map.data.addListener('mouseout',function(event) {
                        map.data.revertStyle();
                    });
                    map.data.addListener('click',function(event) {
                        $scope.$apply(function(){
                            $log.debug('feature click.');
                        });
                    });
                    // kick the map so that it draws properly
                    google_maps.event.trigger(map, 'resize');
                    MapLayerService.getForLayer($scope.layer).then(function(mapLayer){
                        mapLayer.map(map).add();
                    });
                    /*
                    var fid = InitMapService.getInitFeatureId();
                    if(fid) {
                        MapLayerService.getForFeature(fid).then(layerSetter(map));
                    }*/
                });
            });
        }
    };
}]);

angular.module('app-container-geo',[
    'app-container-common',
    'templates-app-container-geo',
    'app-container-geo.admin'
])
.service('Layer',['$appService',function($appService) {
    var Layer = $appService('geo/layer/:id');
    return Layer;
}])
.service('Feature',['$appService',function($appService) {
    var Feature = $appService('geo/feature/:id');
    return Feature;
}])
.factory('MapLayerService',['$q','$http','MapLayer','Feature',function($q,$http,MapLayer,Feature) {
    return {
        getForPoint: function(lat,lng) {
            var def = $q.defer();
            Feature.get({id:'containingPoint',lat:lat,lon:lng},function(response) {
                def.resolve(new MapLayer(response.list));
            });
            return def.promise;
        },
        getForFeature: function(id) {
            var def = $q.defer();
            Feature.get({id: id},function(feature){
                def.resolve(new MapLayer([feature]));
            });
            return def.promise;
        },
        getForLayer: function(layer,q) {
            var def = $q.defer();
            // using the topojson relationship to get a simplified version of
            // the layer (smaller on the wire).  this doesn't solve the issue with
            // layers that have huge numbers of polygons TODO
            $http({
                method: 'GET',
                url: layer._links.topojson+'?q='+(q||'1e4')
            }).then(function(response){
                var topo = response.data,
                    geoJson = topojson.feature(topo,topo.objects.layer);
                def.resolve(new MapLayer(geoJson.features.map(function(f){
                    // need to make geojson features look like feature resource objects
                    var featureObj = angular.extend({},f.properties._featureProps);
                    delete f.properties._featureProps;
                    featureObj.data = f;
                    featureObj._layer = layer;
                    return featureObj;
                })));
            });
            return def.promise;
        }
    };
}])
.factory('MapLayer',['$log','Layer','Feature',function($log,Layer,Feature) {
    var COLOR_SCALE = d3.scaleOrdinal(d3.schemeCategory20),
        BASE_STYLE = {
            strokeColor: '#ffffff',
            strokeOpacity: null,
            strokeWeight: 1,
            fillColor: '#aaaaaa',
            fillOpacity: null,
            zIndex: 0,
            clickable: true
        },
        MapFeature = function(feature,layer) {
            this.$feature = feature;
            this.$layer = layer;
            this.$isOn = true;
            var self = this,
                props = this.$properties = {};
            feature.forEachProperty(function(value,name){
                props[name] = value;
            });
            feature.getMapFeature = function() {
                return self;
            };
        },
        MapLayer = function(features) {
            (this.$features = (features||[])).forEach(function(f){
                var props = f.data.properties;
                // unfortunately when google translates geoJson features into
                // objects it discards properties that are objects
                props.$featureName = f.featureName;
                props.$layerName = f._layer.name;
                props.$layerId = f._layer._id;
                props.$featureId = f._id;
            });
        };
    MapFeature.prototype.getBounds = function() {
        if(!this.$bounds) {
            var bounds = this.$bounds = new google.maps.LatLngBounds(),
                geo = this.$feature.getGeometry(),
                type = geo.getType();
            /*if(!type || /LineString/.test(type)) {
                // TODO ? generate bounds of a [Multi]LineString?
            } else {*/
            if(type && /Polygon/.test(type)) {
                var arr = geo.getArray(),
                    rings = type === 'Polygon' ?
                        arr :
                        arr.reduce(function(c,p){
                            c.push(p.getArray()[0]);
                            return c;
                        },[]),i,j;
                for(i = 0; i < rings.length; i++) {
                    var ringArr = rings[i].getArray();
                    for(j = 0; j < ringArr.length; j++) {
                        bounds.extend(new google.maps.LatLng(ringArr[j].lat(),ringArr[j].lng()));
                    }
                }
            }
        }
        return this.$bounds;
    };
    // this is not truly "area" but sufficient for comparing the size of
    // different feature's bounding boxes
    MapFeature.prototype.$area = function() {
        var bounds = this.getBounds(),
            ne = bounds.getNorthEast(),
            sw = bounds.getSouthWest();
        return Math.abs(ne.lat() - sw.lat()) * Math.abs(ne.lng() - sw.lng());
    };
    MapFeature.prototype.fit = function() {
        this.$layer.map().fitBounds(this.getBounds());
    };
    MapFeature.prototype.on = function() {
        if(!this.$isOn) {
            this.$layer.map().data.add(this.$feature);
            this.$isOn = true;
        }
    };
    MapFeature.prototype.off = function() {
        if(this.$isOn){
            this.$layer.map().data.remove(this.$feature);
            this.$isOn = false;
        }
    };
    MapFeature.prototype.isOn = function() {
        return this.$isOn;
    };
    MapFeature.prototype.toggle = function() {
        this[this.isOn() ? 'off' : 'on']();
        return this.isOn();
    };
    MapFeature.prototype.properties = function() {
        return this.$properties;
    };
    MapFeature.prototype.name = function() {
        return this.$properties.$featureName;
    };
    MapFeature.prototype.id = function() {
        return this.$properties.$featureId;
    };
    MapFeature.prototype.layerId = function() {
        return this.$properties.$layerId;
    };
    MapFeature.prototype.layerName = function() {
        return this.$properties.$layerName;
    };
    MapFeature.prototype.getFeatureResource = function() {
        var self = this;
        if(!self.$featureResource) {
            self.$featureResource = Feature.get({id: self.id()});
            self.$featureResource.$promise.then(function(feature){
                feature.getMapFeature = function() {
                    return self;
                };
            });
        }
        return self.$featureResource.$promise;
    };
    MapFeature.prototype.getLayerResource = function() {
        var self = this;
        if(!self.$layerResource) {
            self.$layerResource = Layer.get({id: self.layerId()});
            self.$layerResource.$promise.then(function(layer){
                layer.getMapFeature = function() {
                    return self;
                };
            });
        }
        return self.$layerResource.$promise;
    };

    MapLayer.prototype.map = function(_) {
        if(!arguments.length) {
            return this.$map;
        }
        this.$map = _;
        return this;
    };
    MapLayer.prototype.geoJson = function() {
        return {
            type: 'FeatureCollection',
            features: this.$features.map(function(feature){
                return feature.data;
            })
        };
    };
    MapLayer.prototype.add = function() {
        var self = this,
            map = self.map(),
            geoFeatures;
        if(map && !self.$mapFeatures) {
            geoFeatures = map.data.addGeoJson(self.geoJson());
            self.$mapFeatures = geoFeatures.map(function(f,i){
                f.setProperty('$style',angular.extend({},BASE_STYLE,{fillColor: COLOR_SCALE(i)}));
                return new MapFeature(f,self);
            });
            // sort features by size and set their zIndex so they are stacked with the largest on the bottom
            self.$mapFeatures.sort(function(a,b){
                return b.$area()-a.$area();
            });
            self.$mapFeatures.forEach(function(f,i) {
                var style = f.$feature.getProperty('$style');
                style.zIndex = i;
            });
            $log.debug('feature stacking order',self.$mapFeatures.reduce(function(arr,f){
                arr.push(f.layerName()+' : '+f.name());
                return arr;
            },[]).join(','));
            map.data.setStyle(function(f){
                return f.getProperty('$style');
            });
        }
        return self;
    };
    MapLayer.prototype.fit = function() {
        // features are already ordered by size, largest at the bottom
        // fit the first feature
        if(this.$mapFeatures && this.$mapFeatures.length) {
            this.$mapFeatures[0].fit();
        }
        return this;
    };
    MapLayer.prototype.features = function() {
        return (this.$mapFeatures||[]);
    };
    MapLayer.prototype.remove = function() {
        this.features().forEach(function(f){
            f.off();
        });
        return this;
    };
    return MapLayer;
}]);

angular.module('templates-app-container-geo', ['js/admin/layer-admin.html', 'js/admin/layer-create-eprops-popover.html', 'js/admin/layer-create-idfmt-popover.html', 'js/admin/layer-create-input-form.html', 'js/admin/layer-create-lname-popover.html', 'js/admin/layer-create-lsource-popover.html', 'js/admin/layer-create-nmfmt-popover.html', 'js/admin/layer-create.html']);

angular.module("js/admin/layer-admin.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/admin/layer-admin.html",
    "<pane-set unique-id=\"layer-admin\" open-heading-cols=\"4\">\n" +
    "    <pane-set-header>\n" +
    "        <div class=\"pane-set-title\" title=\"Layer Administration\"></div>\n" +
    "    </pane-set-header>\n" +
    "    <pane-set-footer>\n" +
    "        <button class=\"btn btn-default pull-right\" ng-click=\"createLayer()\">New Layer</button>\n" +
    "    </pane-set-footer>\n" +
    "\n" +
    "    <pane ng-repeat=\"l in layers.list\" unique-id=\"pane-{{l._id}}\">\n" +
    "        <pane-heading>\n" +
    "            <h4>{{l.name}}</h4>\n" +
    "            <div class=\"file-info\" file=\"l._sourceFile\"></div>\n" +
    "            <a href ng-click=\"removeLayer(l)\">Remove layer</a>\n" +
    "        </pane-heading>\n" +
    "        <div ng-if=\"isPaneActive('pane-'+l._id)\">\n" +
    "            <div class=\"layer-admin-map\" layer=\"l\" />\n" +
    "        </div>\n" +
    "    </pane>\n" +
    "</pane-set>\n" +
    "");
}]);

angular.module("js/admin/layer-create-eprops-popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/admin/layer-create-eprops-popover.html",
    "<div>\n" +
    "    <p>The properties below represent the superset of all available properties\n" +
    "        across all features within your new layer.  Displayed values are pulled\n" +
    "        from first feature to have the given property set.</p>\n" +
    "\n" +
    "    <p>Properties flagged with the <i class=\"fa fa-key\" aria-hidden=\"true\"></i>\n" +
    "        icon have values that are unique across all features within your new layer.</p>\n" +
    "\n" +
    "    <p>If a property has an explicit type (e.g. <code>string</code>,<code>number</code>\n" +
    "        or <code>boolean</code>) then this indicates the property is available\n" +
    "        on all features and has a consistent type across them.</p>\n" +
    "\n" +
    "    <p>A property type of <code>mixed</code> almost certainly indicates that\n" +
    "        property in question is either unset or is <code>null</code>\n" +
    "        for some features.</p>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/admin/layer-create-idfmt-popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/admin/layer-create-idfmt-popover.html",
    "<div>\n" +
    "    <p>Each feature added to the system must have an id that identifies it uniquely\n" +
    "        within its layer.</p>\n" +
    "    <p>If this layer is updated in the future (e.g. boundaries re-defined) it may be\n" +
    "        desireable to allow the feature data to be updated in place rather than\n" +
    "        recreated.  For example if other entities are to be associated with a given feature\n" +
    "        to prevent data integrity problems.</p>\n" +
    "    <p>The property format syntax is basic <code>sprintf</code> format without\n" +
    "        surrounding <code>&quot;</code> characters.  Unlike standard <code>sprintf</code>\n" +
    "        you can wrap optional properties in <code>[]</code>.</p>\n" +
    "    <p><em>Example:</em> If your features had a unique property, <code>GEOID</code> that\n" +
    "        is guaranteed to remain constant moving forward you could specify a format\n" +
    "        like <code>%s,GEOID</code>.</p>\n" +
    "    <p><em>Example:</em> If your features had two properties then when put together\n" +
    "        would guarantee uniqueness, and remain constant moving forward, you could\n" +
    "        specify a format like <code>%s.%s,MAINID,SUBID</code>.</p>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/admin/layer-create-input-form.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/admin/layer-create-input-form.html",
    "<form name=\"newLayerForm\" ng-if=\"userInput && preResults\">\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"inputFile\">Source File</label>\n" +
    "        <div id=\"inputFile\" class=\"file-info\" file=\"uploadedFile\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "        <div class=\"text-danger pull-right\" ng-if=\"newLayerForm.$error.layerNameinUse.length\">\n" +
    "            The layer name &quot;{{newLayerForm.$error.layerNameinUse[0].$viewValue}}&quot; is already in use.\n" +
    "        </div>\n" +
    "        <label for=\"layerName\">Layer Name <i uib-popover-template=\"'js/admin/layer-create-lname-popover.html'\" popover-placement=\"auto right\" class=\"fa fa-info-circle\" aria-hidden=\"true\"></i> *</label>\n" +
    "        <input id=\"layerName\" type=\"text\" class=\"form-control\"\n" +
    "               ng-model=\"userInput.layerName\" layer-name-validate required />\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "        <div class=\"text-danger pull-right\" ng-if=\"newLayerForm.$error.userInput_featureIdFmt_propertyFormat.length\">\n" +
    "            Invalid format\n" +
    "        </div>\n" +
    "        <label for=\"featureIdFmt\">Feature Id Format <i uib-popover-template=\"'js/admin/layer-create-idfmt-popover.html'\" popover-placement=\"auto right\" class=\"fa fa-info-circle\" aria-hidden=\"true\"></i> *</label>\n" +
    "        <input id=\"featureIdFmt\" type=\"text\" class=\"form-control\"\n" +
    "               ng-model=\"userInput.featureIdFmt\"\n" +
    "               property-format-validate=\"preResults.exampleProperties\" required />\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "        <div class=\"text-danger pull-right\" ng-if=\"newLayerForm.$error.userInput_featureNameFmt_propertyFormat.length\">\n" +
    "            Invalid format\n" +
    "        </div>\n" +
    "        <label for=\"featureNameFmt\">Feature Name Format <i uib-popover-template=\"'js/admin/layer-create-nmfmt-popover.html'\" popover-placement=\"auto right\" class=\"fa fa-info-circle\" aria-hidden=\"true\"></i> *</label>\n" +
    "        <input id=\"featureNameFmt\" type=\"text\" class=\"form-control\"\n" +
    "               ng-model=\"userInput.featureNameFmt\"\n" +
    "               property-format-validate=\"preResults.exampleProperties\" required />\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "        <label for=\"layerSource\">Layer Source <i uib-popover-template=\"'js/admin/layer-create-lsource-popover.html'\" popover-placement=\"auto right\" class=\"fa fa-info-circle\" aria-hidden=\"true\"></i> </label>\n" +
    "        <input id=\"layerSource\" type=\"url\" class=\"form-control\"\n" +
    "               ng-model=\"userInput.layerSource\" />\n" +
    "    </div>\n" +
    "    <ul class=\"list-inline pull-right\">\n" +
    "        <li><button class=\"btn btn-default\" ng-click=\"dismiss()\">Cancel</button></li>\n" +
    "        <li><button class=\"btn btn-default\" ng-click=\"add()\" ng-disabled=\"newLayerForm.$invalid\">Create</button></li>\n" +
    "    </ul>\n" +
    "</form>\n" +
    "");
}]);

angular.module("js/admin/layer-create-lname-popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/admin/layer-create-lname-popover.html",
    "<div>\n" +
    "    Specify your layer name here.  Your layer name must be unique within the system.\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/admin/layer-create-lsource-popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/admin/layer-create-lsource-popover.html",
    "<div>\n" +
    "    <p>It may be useful to keep track of where the source of this layer originated.\n" +
    "    If you downloaded the data from a web address you can record that here.</p>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/admin/layer-create-nmfmt-popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/admin/layer-create-nmfmt-popover.html",
    "<div>\n" +
    "    <p>Each feature added to the system should have a friendly name to identify it.\n" +
    "        Feature names are generated from each feature's properties.</p>\n" +
    "    <p>The property format syntax is basic <code>sprintf</code> format without\n" +
    "        surrounding <code>&quot;</code> characters.  Unlike standard <code>sprintf</code>\n" +
    "        you can wrap optional properties in <code>[]</code>.</p>\n" +
    "    <p><em>Example:</em> If your features had a unique property, <code>UNITNAME</code> that\n" +
    "        is guaranteed to remain constant moving forward you could specify a format\n" +
    "        like <code>%s,UNITNAME</code>.</p>\n" +
    "    <p><em>Example:</em> If your features had two properties then when put together\n" +
    "        would create a more meaningful feature name, but one of the two properties\n" +
    "        is not always available (not unique, type <code>mixed</code>), you might\n" +
    "        specify a format like <code>%s[ (%s)],UNITNAME,SUBUNITNAME</code>.</p>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/admin/layer-create.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/admin/layer-create.html",
    "<div class=\"clearfix modal-header\">\n" +
    "    <ul class=\"list-inline pull-right\">\n" +
    "        <li class=\"spinner\" is-working=\"!STATE || [STATE.FILE_UPLOAD,STATE.USER_INPUT].indexOf(STATE) !== -1\"></li>\n" +
    "        <li><a href class=\"pull-right\" ng-click=\"dismiss()\"><i class=\"fa fa-times-circle-o fa-2x\"></i></a></li>\n" +
    "    </ul>\n" +
    "\n" +
    "    <h2>Add Layer</h2>\n" +
    "</div>\n" +
    "<div class=\"clearfix modal-body\">\n" +
    "    <p ng-if=\"!STATE\">Waiting to establish connection...</p>\n" +
    "\n" +
    "    <div ng-show=\"STATE === STATES.FILE_UPLOAD\">\n" +
    "        <p>Start by uploading the source of your layer (currently only zipped shapfile).</p>\n" +
    "        <input type=\"file\" file-model=\"fileToUpload\" file-resource=\"fileResource\" />\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-show=\"STATE === STATES.USER_INPUT\">\n" +
    "        <p>Your new layer will have <mark>{{preResults.featureCount}}</mark> features (assuming they can all\n" +
    "            be successfully indexed).</p>\n" +
    "        <div class=\"layer-create-input-form clearfix\"></div>\n" +
    "        <div class=\"example-layer-properties\"></div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-if=\"STATE === STATES.COMPLETE && userInput\">\n" +
    "        Layer {{userInput.layerName}} added.\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);
