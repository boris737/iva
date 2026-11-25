import{M as T,V as p,l as $,F as Ye,m as Pe,P as je,n as Oe,H as Ke,U as Ae,o as Fe,p as xe,q as $e,r as De,W as Je,s as ge,A as Qe,S as Ze,t as et,T as tt,u as ot,v as nt,B as pe,w as at,x as Le,y as Ue,z as O,I as rt,J as ve,G as fe,h as ce,K as it,N as st,Q as Te,R as ct,e as lt,X as dt,Y as Be,Z as ut,_ as mt,a as pt,c as ft,D as vt,L as ht,E as wt,d as Re,$ as ze,g as gt,j as xt,i as yt,k as Mt}from"./three.module.DELviqzQ.js";class St extends T{constructor(v,a={}){super(v),this.isWater=!0;const s=this,E=a.textureWidth!==void 0?a.textureWidth:512,y=a.textureHeight!==void 0?a.textureHeight:512,I=a.clipBias!==void 0?a.clipBias:0,h=a.alpha!==void 0?a.alpha:1,S=a.time!==void 0?a.time:0,U=a.waterNormals!==void 0?a.waterNormals:null,W=a.sunDirection!==void 0?a.sunDirection:new p(.70707,.70707,0),ne=new $(a.sunColor!==void 0?a.sunColor:16777215),de=new $(a.waterColor!==void 0?a.waterColor:8355711),q=a.eye!==void 0?a.eye:new p(0,0,0),J=a.distortionScale!==void 0?a.distortionScale:20,Q=a.side!==void 0?a.side:Ye,R=a.fog!==void 0?a.fog:!1,P=new $e,A=new p,z=new p,X=new p,Z=new Pe,Y=new p(0,0,-1),F=new De,N=new p,ae=new p,ee=new De,H=new Pe,w=new je,re=new Oe(E,y,{type:Ke}),ie={name:"MirrorShader",uniforms:Ae.merge([Fe.fog,Fe.lights,{normalSampler:{value:null},mirrorSampler:{value:null},alpha:{value:1},time:{value:0},size:{value:1},distortionScale:{value:20},textureMatrix:{value:new Pe},sunColor:{value:new $(8355711)},sunDirection:{value:new p(.70707,.70707,0)},eye:{value:new p},waterColor:{value:new $(5592405)}}]),vertexShader:`
				uniform mat4 textureMatrix;
				uniform float time;

				varying vec4 mirrorCoord;
				varying vec4 worldPosition;

				#include <common>
				#include <fog_pars_vertex>
				#include <shadowmap_pars_vertex>
				#include <logdepthbuf_pars_vertex>

				void main() {
					mirrorCoord = modelMatrix * vec4( position, 1.0 );
					worldPosition = mirrorCoord.xyzw;
					mirrorCoord = textureMatrix * mirrorCoord;
					vec4 mvPosition =  modelViewMatrix * vec4( position, 1.0 );
					gl_Position = projectionMatrix * mvPosition;

				#include <beginnormal_vertex>
				#include <defaultnormal_vertex>
				#include <logdepthbuf_vertex>
				#include <fog_vertex>
				#include <shadowmap_vertex>
			}`,fragmentShader:`
				uniform sampler2D mirrorSampler;
				uniform float alpha;
				uniform float time;
				uniform float size;
				uniform float distortionScale;
				uniform sampler2D normalSampler;
				uniform vec3 sunColor;
				uniform vec3 sunDirection;
				uniform vec3 eye;
				uniform vec3 waterColor;

				varying vec4 mirrorCoord;
				varying vec4 worldPosition;

				vec4 getNoise( vec2 uv ) {
					vec2 uv0 = ( uv / 103.0 ) + vec2(time / 17.0, time / 29.0);
					vec2 uv1 = uv / 107.0-vec2( time / -19.0, time / 31.0 );
					vec2 uv2 = uv / vec2( 8907.0, 9803.0 ) + vec2( time / 101.0, time / 97.0 );
					vec2 uv3 = uv / vec2( 1091.0, 1027.0 ) - vec2( time / 109.0, time / -113.0 );
					vec4 noise = texture2D( normalSampler, uv0 ) +
						texture2D( normalSampler, uv1 ) +
						texture2D( normalSampler, uv2 ) +
						texture2D( normalSampler, uv3 );
					return noise * 0.5 - 1.0;
				}

				void sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor ) {
					vec3 reflection = normalize( reflect( -sunDirection, surfaceNormal ) );
					float direction = max( 0.0, dot( eyeDirection, reflection ) );
					specularColor += pow( direction, shiny ) * sunColor * spec;
					diffuseColor += max( dot( sunDirection, surfaceNormal ), 0.0 ) * sunColor * diffuse;
				}

				#include <common>
				#include <packing>
				#include <bsdfs>
				#include <fog_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <lights_pars_begin>
				#include <shadowmap_pars_fragment>
				#include <shadowmask_pars_fragment>

				void main() {

					#include <logdepthbuf_fragment>
					vec4 noise = getNoise( worldPosition.xz * size );
					vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );

					vec3 diffuseLight = vec3(0.0);
					vec3 specularLight = vec3(0.0);

					vec3 worldToEye = eye-worldPosition.xyz;
					vec3 eyeDirection = normalize( worldToEye );
					sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );

					float distance = length(worldToEye);

					vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;
					vec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.w + distortion ) );

					float theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );
					float rf0 = 0.02;
					float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );
					vec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * waterColor;
					vec3 albedo = mix( ( sunColor * diffuseLight * 0.3 + scatter ) * getShadowMask(), reflectionSample + specularLight, reflectance );
					vec3 outgoingLight = albedo;
					gl_FragColor = vec4( outgoingLight, alpha );

					#include <tonemapping_fragment>
					#include <colorspace_fragment>
					#include <fog_fragment>	
				}`},C=new xe({name:ie.name,uniforms:Ae.clone(ie.uniforms),vertexShader:ie.vertexShader,fragmentShader:ie.fragmentShader,lights:!0,side:Q,fog:R});C.uniforms.mirrorSampler.value=re.texture,C.uniforms.textureMatrix.value=H,C.uniforms.alpha.value=h,C.uniforms.time.value=S,C.uniforms.normalSampler.value=U,C.uniforms.sunColor.value=ne,C.uniforms.waterColor.value=de,C.uniforms.sunDirection.value=W,C.uniforms.distortionScale.value=J,C.uniforms.eye.value=q,s.material=C,s.onBeforeRender=function(M,D,j){if(z.setFromMatrixPosition(s.matrixWorld),X.setFromMatrixPosition(j.matrixWorld),Z.extractRotation(s.matrixWorld),A.set(0,0,1),A.applyMatrix4(Z),N.subVectors(z,X),N.dot(A)>0)return;N.reflect(A).negate(),N.add(z),Z.extractRotation(j.matrixWorld),Y.set(0,0,-1),Y.applyMatrix4(Z),Y.add(X),ae.subVectors(z,Y),ae.reflect(A).negate(),ae.add(z),w.position.copy(N),w.up.set(0,1,0),w.up.applyMatrix4(Z),w.up.reflect(A),w.lookAt(ae),w.far=j.far,w.updateMatrixWorld(),w.projectionMatrix.copy(j.projectionMatrix),H.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),H.multiply(w.projectionMatrix),H.multiply(w.matrixWorldInverse),P.setFromNormalAndCoplanarPoint(A,z),P.applyMatrix4(w.matrixWorldInverse),F.set(P.normal.x,P.normal.y,P.normal.z,P.constant);const b=w.projectionMatrix;ee.x=(Math.sign(F.x)+b.elements[8])/b.elements[0],ee.y=(Math.sign(F.y)+b.elements[9])/b.elements[5],ee.z=-1,ee.w=(1+b.elements[10])/b.elements[14],F.multiplyScalar(2/F.dot(ee)),b.elements[2]=F.x,b.elements[6]=F.y,b.elements[10]=F.z+1-I,b.elements[14]=F.w,q.setFromMatrixPosition(j.matrixWorld);const he=M.getRenderTarget(),ye=M.xr.enabled,se=M.shadowMap.autoUpdate;s.visible=!1,M.xr.enabled=!1,M.shadowMap.autoUpdate=!1,M.setRenderTarget(re),M.state.buffers.depth.setMask(!0),M.autoClear===!1&&M.clear(),M.render(D,w),s.visible=!0,M.xr.enabled=ye,M.shadowMap.autoUpdate=se,M.setRenderTarget(he);const te=j.viewport;te!==void 0&&M.state.viewport(te)}}}const K=(n,v=0,a=1)=>Math.min(a,Math.max(v,n)),le=n=>(n=K(n),n*n*(3-2*n)),Ct=n=>(n=K(n),n<.5?4*n*n*n:1-Math.pow(-2*n+2,3)/2),Ge=(n,v,a)=>n+(v-n)*a,Ne=new $(14698574),He=new $(16765604),Pt=document.createElement("video").canPlayType('video/webm; codecs="vp9"')?".webm":".mp4",_t=n=>n.replace(/\.(mp4|webm)$/,"")+Pt;function bt(){const n=document.createElement("canvas");n.width=n.height=256;const v=n.getContext("2d"),a=v.createRadialGradient(128,128,0,128,128,128);a.addColorStop(0,"rgba(255,214,170,1)"),a.addColorStop(.4,"rgba(255,214,170,.35)"),a.addColorStop(1,"rgba(255,214,170,0)"),v.fillStyle=a,v.fillRect(0,0,256,256);const s=new Be(n);return s.colorSpace=ge,s}function kt(n=256){const v=document.createElement("canvas");v.width=v.height=n;const a=v.getContext("2d"),s=new Float32Array(n*n),E=Array.from({length:14},()=>({kx:Math.round((Math.random()-.5)*16),ky:Math.round((Math.random()-.5)*16),p:Math.random()*6.28,a:.3+Math.random()}));for(let h=0;h<n;h++)for(let S=0;S<n;S++){let U=0;for(const W of E)U+=W.a*Math.sin((W.kx*S+W.ky*h)/n*6.2832+W.p);s[h*n+S]=U}const y=a.createImageData(n,n);for(let h=0;h<n;h++)for(let S=0;S<n;S++){const U=s[h*n+(S-1+n)%n],W=s[h*n+(S+1)%n],ne=s[(h-1+n)%n*n+S],de=s[(h+1)%n*n+S],q=(U-W)*.18,J=(ne-de)*.18,Q=1,R=Math.hypot(q,J,Q),P=(h*n+S)*4;y.data[P]=(q/R*.5+.5)*255,y.data[P+1]=(J/R*.5+.5)*255,y.data[P+2]=(Q/R*.5+.5)*255,y.data[P+3]=255}a.putImageData(y,0,0);const I=new Be(v);return I.wrapS=I.wrapT=ut,I}function Et(n,v,a=1){return new xe({transparent:!0,depthWrite:!1,blending:ve,uniforms:{map:{value:n},color:{value:v},k:{value:0},strength:{value:a}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",fragmentShader:`uniform sampler2D map; uniform vec3 color; uniform float k; uniform float strength; varying vec2 vUv;
      void main(){ vec4 t = texture2D(map, vUv); float lum = dot(t.rgb, vec3(.299,.587,.114));
        float ink = smoothstep(.08, .6, 1. - lum) * t.a; float edge = smoothstep(0.,.04,vUv.x)*smoothstep(1.,.96,vUv.x)*smoothstep(0.,.04,vUv.y)*smoothstep(1.,.96,vUv.y);
        float d = k * 1.18 - .09; float drawn = 1. - smoothstep(d - .06, d, vUv.x); float pen = exp(-pow((vUv.x - d) * 38., 2.)) * step(.001, k) * (1. - step(.999, k));
        gl_FragColor = vec4(color * ink * edge * strength * (drawn * min(1., k * 1.6) + pen * 2.), 1.); }`})}async function At(n,v,a){const{mobile:s}=a,E=new Je({canvas:n,antialias:!0,powerPreference:"high-performance"});E.setPixelRatio(Math.min(devicePixelRatio||1,s?1.6:1.75)),E.outputColorSpace=ge,E.toneMapping=Qe,E.toneMappingExposure=1;const y=new Ze,I=new $(1316902);y.fog=new et(I.getHex(),s?.0085:.0072);const h=new je(s?56:38,1,.1,1600),S=new tt,U=t=>S.loadAsync(t).then(e=>(e.colorSpace=ge,e.anisotropy=Math.min(8,E.capabilities.getMaxAnisotropy()),e)),W=bt(),ne={night:{value:0}},de=new T(new ot(900,48,24),new xe({side:nt,depthWrite:!1,fog:!1,uniforms:ne,vertexShader:"varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",fragmentShader:`uniform float night; varying vec3 vP;
      void main(){ float y = vP.y; float az = atan(vP.x, -vP.z);
        vec3 zen = mix(vec3(.05,.07,.14), vec3(.015,.02,.05), night);
        vec3 mid = mix(vec3(.17,.19,.30), vec3(.04,.05,.11), night);
        vec3 hor = mix(vec3(.98,.58,.34), vec3(.28,.18,.30), night);
        float sun = exp(-pow(az * 1.4, 2.)) * (1. - night * .8);
        vec3 c = mix(mid, zen, smoothstep(.05, .55, y));
        c = mix(c, hor, exp(-max(y, 0.) * (16. - sun * 7.)) * (.75 + sun * .5));
        c = mix(c, vec3(.05,.06,.09), smoothstep(0., -.06, y));
        gl_FragColor = vec4(c, 1.); }`}));y.add(de);const q=new pe,J=[];for(let t=0;t<900;t++){const e=Math.random()*6.28,o=.08+Math.random()*.9,r=850;J.push(Math.cos(e)*r*Math.sqrt(1-o*o),o*r,Math.sin(e)*r*Math.sqrt(1-o*o))}q.setAttribute("position",new at(J,3));const Q=new Le({color:16777215,size:1.6,sizeAttenuation:!1,transparent:!0,opacity:0,fog:!1,depthWrite:!1});y.add(new Ue(q,Q));const R=new St(new O(2400,2400),{textureWidth:s?512:1024,textureHeight:s?512:1024,waterNormals:kt(),sunDirection:new p(0,.25,-1).normalize(),sunColor:16762778,waterColor:659224,distortionScale:.7,fog:!0});R.rotation.x=-Math.PI/2,R.material.uniforms.size.value=6,y.add(R);const P=s?380:800,A=new Float32Array(P*3);for(let t=0;t<P;t++)A[t*3]=(Math.random()-.5)*180,A[t*3+1]=Math.random()*30,A[t*3+2]=40-Math.random()*560;const z=new pe;z.setAttribute("position",new rt(A,3)),y.add(new Ue(z,new Le({map:W,size:.28,transparent:!0,opacity:.45,depthWrite:!1,blending:ve,color:16769216})));const X=[],Z=t=>{const e=document.createElement("video");return e.muted=!0,e.loop=!0,e.playsInline=!0,e.preload="auto",e.setAttribute("muted",""),e.setAttribute("playsinline",""),e.setAttribute("webkit-playsinline",""),e.src=_t(t),X.push(e),window.__vids=X,e},Y=[],F=async(t,e,o,r,i=1.6)=>{const l=r*o,g=await U(e.img),d=new ce({map:g,toneMapped:!1});d.color.setScalar(.62);const u=new T(new O(l,r),d);u.position.y=r/2+i,t.add(u);const m=new ce({color:16770764,transparent:!0,opacity:.25,toneMapped:!1}),c=Math.max(.03,r*.004);[[0,r/2+c/2,l+c*2,c],[0,-r/2-c/2,l+c*2,c],[-l/2-c/2,0,c,r],[l/2+c/2,0,c,r]].forEach(([L,oe,qe,Xe])=>{const We=new T(new O(qe,Xe),m);We.position.set(L,oe,.005),u.add(We)});const f=new xe({transparent:!0,depthWrite:!1,blending:ve,uniforms:{x:{value:-1},a:{value:0}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",fragmentShader:"uniform float x; uniform float a; varying vec2 vUv; void main(){ float d = (vUv.x + vUv.y * .35) - x; float b = exp(-d*d*120.); gl_FragColor = vec4(vec3(1.,.94,.86) * b * a * .18, 1.); }"}),_=new T(new O(l,r),f);_.position.z=.01,u.add(_);const B=new T(new O(l*1.9,r*2.2),new ce({map:W,transparent:!0,opacity:.08,depthWrite:!1,blending:ve}));B.position.set(0,0,-.5),u.add(B);const V=new T(new O(l*1.5,l*.7),new ce({map:W,transparent:!0,opacity:.1,depthWrite:!1,blending:ve}));V.rotation.x=-Math.PI/2,V.position.set(0,.06,l*.22),t.add(V);const x={mesh:u,mat:d,live:!1,sheen:f,halo:B,pool:V,edge:m,w:l,h:r,media:e};return e.video&&(x.v=Z(e.video),x.v.addEventListener("playing",()=>{x.vtex||(x.vtex=new mt(x.v),x.vtex.colorSpace=ge),x.mat.map=x.vtex,x.mat.needsUpdate=!0,x.live=!0})),u.__panel=x,Y.push(u),x},N=async(t,e,o,r,i,l=Ne,g=1.1)=>{const d=await U(e),u=Et(d,l,g),m=new T(new O(r,r/o),u);return m.rotation.x=-Math.PI/2,m.position.set(0,.08,i),t.add(m),u},ae=()=>{const t=new fe,e=c=>new gt({color:Ne,transparent:!0,opacity:c}),o=new pt;o.moveTo(0,0),o.lineTo(26,0),o.quadraticCurveTo(46,3,62,14),o.lineTo(112,14),o.lineTo(112,28),o.lineTo(0,28),o.lineTo(0,0);const r=6,i=new ft(o,{depth:r,bevelEnabled:!1,curveSegments:28});i.rotateX(-Math.PI/2),t.add(new T(i,new ce({color:14698574,transparent:!0,opacity:.08,depthWrite:!1,side:vt}))),t.add(new ht(new wt(i,20),e(.95)));const l=new pe().setFromPoints([new p,new p(0,r,0)]);o.getSpacedPoints(84).forEach(c=>{const f=new Re(l,e(.4));f.position.set(c.x,0,-c.y),t.add(f)});const g=9.5,d=3.6,u=c=>new xt(new pe().setFromPoints(new yt(0,0,g,g).getSpacedPoints(100).map(f=>new p(f.x,c,f.y))),e(1)),m=new fe;m.add(u(0),u(d));for(let c=0;c<64;c++){const f=c/64*Math.PI*2;m.add(new Re(new pe().setFromPoints([new p(Math.cos(f)*g,0,Math.sin(f)*g),new p(Math.cos(f)*g,d,Math.sin(f)*g)]),e(.35)))}return m.position.set(17,r,-16),t.add(m),t.scale.setScalar(.16),t.position.set(-9,.05,10),t.rotation.y=.35,t},ee=s?42:50,H=[];let w=0;for(let t=0;t<v.length;t++){const e=v[t],o=new fe;y.add(o);const r=e.side??(t%2?-1:1),i={focus:new p,side:r,size:10,w:10,h:10,group:o,ink:[],more:[],lit:0};if(e.kind==="arrival"||e.kind==="close")i.focus.set(0,6,w);else{w-=ee;const l=r*(s?4:9);if(o.position.set(l,0,w),o.rotation.y=-r*.12,e.kind==="slab"||e.kind==="iva"){const d=await F(o,{img:e.img,video:e.video,label:e.label},e.aspect??1.4,9);if(i.main=d,i.w=d.w,i.h=d.h,i.size=Math.max(d.w,d.h*1.4),i.focus.set(l,9/2+1.6,w),e.floor&&i.ink.push(await N(o,e.floor,e.floorAspect??1.4,Math.min(20,d.w*1.15),d.w*.5+5)),e.logo&&i.ink.push(await N(o,e.logo,e.logoAspect??3,16,8,He,.8)),e.massing){const u=ae();o.add(u),i.massing=u}if(e.night){const u=new ce({map:await U(e.night),transparent:!0,opacity:0,toneMapped:!1,depthWrite:!1}),m=new T(new O(d.w,d.h),u);m.position.z=.003,d.mesh.add(m),i.night=u}if(e.extras?.length){const u=new fe;y.add(u);const m=s?4.6:5.2,c=.9,f=e.extras.map(L=>m*L.aspect),_=f.reduce((L,oe)=>L+oe,0)+c*(f.length-1);let B=-_/2;for(let L=0;L<e.extras.length;L++){const oe=new fe;oe.position.x=B+f[L]/2,u.add(oe),B+=f[L]+c,i.more.push(await F(oe,e.extras[L],e.extras[L].aspect,m,2.2))}const V=l-r*(d.w/2+7+_/2),x=w-8;u.position.set(V,0,x),u.rotation.y=r*.18,i.row={center:new p(V,m/2+2.2,x),w:_,h:m}}}else if(e.kind==="materials"){(await Promise.all((e.mats??[]).map(U))).forEach((m,c)=>{const f=6+c%2*1.8,_=new T(new it(2.8,f,2.8),new st({map:m,roughness:.7,metalness:0}));_.position.set((c-1.5)*3.9,f/2+.3,c%2*1.2),_.rotation.y=(c-1.5)*.14,o.add(_)});const d=new Te(16756848,160,36,1.6);d.position.set(-3,10,8),o.add(d);const u=new Te(16766632,50,30,1.8);u.position.set(7,4,10),o.add(u),o.add(new ct(16769732,1053468,.35)),e.logo&&i.ink.push(await N(o,e.logo,e.logoAspect??1,10,9,He,.8)),i.focus.set(l,4.2,w),i.size=17,i.w=17,i.h=9}}H.push(i)}const re=w,ie=()=>n.clientWidth/Math.max(1,n.clientHeight),C=(t,e,o,r,i,l,g,d)=>{const u=ie(),m=Mt.degToRad(h.fov),c=2*Math.atan(Math.tan(m/2)*u),f=Math.max(o/i/(2*Math.tan(m/2)),e/l/(2*Math.tan(c/2))),_=new p(Math.sin(r),0,Math.cos(r)),B=t.clone().addScaledVector(_,f);B.y+=.6;const V=new p(_.z,0,-_.x),x=t.clone();return x.addScaledVector(V,-g*2*Math.tan(c/2)*f),x.y-=d*2*Math.tan(m/2)*f,{pos:B,at:x}},M=()=>{const t=[];return H.forEach((e,o)=>{const r=v[o];if(r.kind==="arrival")t.push({pos:new p(s?0:-4,s?11:9,40),at:new p(s?0:6,7,-180),s0:o,s1:o+.12});else if(r.kind==="close")t.push({pos:new p(s?-2:-12,s?28:26,re*.35+(s?45:60)),at:new p(s?0:8,3,re*.8),s0:o-.05,s1:o+1});else{const i=-e.side*.12,l=s?C(e.focus,e.w,e.h,i,.46,.94,0,.2):C(e.focus,e.w,e.h,i,.8,.62,.16,0),g=!!e.row;if(t.push({...l,s0:o,s1:o+(g?.22:.34)}),e.row){const c=s?C(e.row.center,e.row.w,e.row.h,e.side*.18,.4,.96,0,.18):C(e.row.center,e.row.w,e.row.h,e.side*.18,.5,.84,.04,-.06);t.push({...c,s0:o+.44,s1:o+.6})}const d=H[o+1],m=(g?t[t.length-1].pos:l.pos).clone().lerp(d&&v[o+1].kind!=="close"?d.focus:new p(0,8,re),.45);m.y=Math.max(m.y,15),m.x=Ge(m.x,e.group.position.x-e.side*18,.5),t.push({pos:m,at:(d?.focus??e.focus).clone(),s0:o+.8,s1:o+.8})}}),t};let D=M(),j,b;const he=()=>{j=new ze(D.map(t=>t.pos),!1,"centripetal"),b=new ze(D.map(t=>t.at),!1,"centripetal")};he();const ye=t=>{const e=D.length-1;if(t<=D[0].s1)return 0;for(let o=0;o<e;o++){if(t<=D[o+1].s0){const r=(t-D[o].s1)/Math.max(1e-6,D[o+1].s0-D[o].s1);return(o+Ct(r))/e}if(t<=D[o+1].s1)return(o+1)/e}return 1},se=new dt,te=new lt;let ue=null;addEventListener("pointerdown",t=>{ue={x:t.clientX,y:t.clientY,t:performance.now()}},{passive:!0}),addEventListener("pointerup",t=>{if(!ue||Math.hypot(t.clientX-ue.x,t.clientY-ue.y)>8||performance.now()-ue.t>450||t.target.closest("a,button,[data-cb],dialog,.site-head,.site-foot"))return;te.set(t.clientX/innerWidth*2-1,-(t.clientY/innerHeight)*2+1),se.setFromCamera(te,h);const e=se.intersectObjects(Y,!1)[0];e&&a.open(e.object.__panel.media)}),addEventListener("pointermove",t=>{t.pointerType==="mouse"&&(te.set(t.clientX/innerWidth*2-1,-(t.clientY/innerHeight)*2+1),se.setFromCamera(te,h),document.documentElement.style.cursor=se.intersectObjects(Y,!1).length&&!t.target.closest("a,button")?"pointer":"")},{passive:!0});const G={x:0,y:0,tx:0,ty:0};matchMedia("(hover: hover) and (pointer: fine)").matches&&addEventListener("pointermove",t=>{G.tx=t.clientX/innerWidth-.5,G.ty=t.clientY/innerHeight-.5},{passive:!0});const _e=()=>{const t=n.clientWidth,e=n.clientHeight;E.setSize(t,e,!1),h.aspect=t/e,h.updateProjectionMatrix(),D=M(),he()};new ResizeObserver(_e).observe(n),_e();let we=0,k=0,Me=0;const be=new p,ke=new p,Ve=new p,Ee=(t,e,o)=>{t.mat.color.setScalar(.62+.38*e),t.halo.material.opacity=.03+.09*e,t.pool.material.opacity=.03+.12*e,t.edge.opacity=.1+.3*e,t.sheen.uniforms.x.value=Ge(-.3,1.5,e),t.sheen.uniforms.a.value=Math.sin(Math.PI*e),t.v&&(o&&t.v.paused&&t.v.play().catch(()=>{}),!o&&!t.v.paused&&t.v.pause())},Ie=()=>{H.forEach((e,o)=>{const r=K(1-Math.abs(k-o)/.9),i=le(r);e.lit+=(i-e.lit)*.1,e.ink.forEach(g=>g.uniforms.k.value=i),e.massing&&(e.massing.scale.y=Math.max(.001,le(K((r-.25)/.75))*.16)),e.main&&(Ee(e.main,e.lit,k>o-.9&&k<o+.75),e.group.position.y=Math.sin(Me*.5+o*1.7)*.1);const l=le(K(1-Math.abs(k-(o+.52))/.45));e.more.forEach((g,d)=>Ee(g,le(K(l*1.25-d*.12)),k>o+.05&&k<o+.95)),e.night&&(e.night.opacity=le(K((k-(v.length-2.2))/1)))});const t=le(K((k-(v.length-2.2))/1));ne.night.value=t,Q.opacity=t*.9,y.fog.color.copy(I).lerp(new $(461072),t),E.toneMappingExposure=1-t*.1};let me=!0,Se=performance.now();const Ce=t=>{if(!me)return;const e=Math.min(.05,(t-Se)/1e3);Se=t,Me+=e,k+=(we-k)*(1-Math.exp(-e*3.2)),Math.abs(we-k)<1e-4&&(k=we);const o=ye(k);j.getPoint(o,be),b.getPoint(o,ke),G.x+=(G.tx-G.x)*.05,G.y+=(G.ty-G.y)*.05,h.position.copy(be).add(Ve.set(G.x*1.6,-G.y*.9,0)),h.lookAt(ke),Ie(),R.material.uniforms.time.value=Me*.35;const r=z.attributes.position;for(let i=0;i<P;i++){let l=r.getY(i)+e*.3;l>30&&(l=0),r.setY(i,l)}r.needsUpdate=!0,E.render(y,h),requestAnimationFrame(Ce)};return requestAnimationFrame(Ce),document.addEventListener("visibilitychange",()=>{const t=me;me=!document.hidden,me&&!t&&(Se=performance.now(),requestAnimationFrame(Ce)),me||X.forEach(e=>e.pause())}),{set:t=>{we=t},stations:v.length,pauseAll:()=>X.forEach(t=>t.pause())}}export{At as mountWorld,_t as videoUrl};
