/* bg4.js · backgrounds as LIT SPACES (WebGL2 fragment shaders), replacing the flat CSS/canvas versions of
   aurora · stars · blobs · beams · grid · light-tunnel · topo · bokeh · gradient-shift · noise-mesh · spotlight · wave-lines
   Why: the old backgrounds were soft colour fields: no light direction, no layers, nothing in front of or behind anything.
   Here every one has (1) a light source and falloff, (2) 2-3 depth layers that parallax with the cursor,
   (3) volume or material (curtains, glossy liquid, dust in a beam, lit terrain, discs with soft focus), (4) tone shoulder + dither.
   Theme colours: --accent, --accent2, --bg. Light themes are handled (ink-on-paper mapping). Reduced motion = one still frame.
   Falls back to the previous implementation when WebGL2 is unavailable. init(root,{intensity}) -> {destroy, boost}. */
(function () {
  'use strict';
  const D = window.Deck, R = D.reg.bg, h = D.h;
  const HEAD = `#version 300 es
precision highp float;
uniform vec2 uR, uM; uniform float uT, uI, uLight; uniform vec3 uA, uB, uBg; out vec4 oc;
float h21(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}   // hash without large products: no blocky patches
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
float dustf(vec2 p, float sc, float sp){ vec2 g=p*sc+vec2(0.,uT*sp), id=floor(g), f=fract(g)-.5; float r=h21(id), d=length(f-(vec2(h21(id+1.7),h21(id+5.3))-.5)*.6);
  return smoothstep(.16,.0,d)*step(.7,r)*(.55+.45*sin(uT*2.+r*40.)); }                                  // round motes, not value-noise squares

// one graph layer: points jittered inside grid cells, short links to the 8 neighbours, optional data packets on the links
vec3 netL(vec2 p, float sc, float fl, vec2 par, float linkW, float dotS, float pk, float lk){
  vec2 g=p*sc+par+vec2(uT*.02*(1.+fl),uT*.012), id=floor(g); vec3 c=vec3(0.); vec2 P[9];
  for(int j=0;j<9;j++){ vec2 cid=id+vec2(float(j-(j/3)*3)-1.,float(j/3)-1.), r=vec2(h21(cid+fl*13.),h21(cid+9.1+fl*13.));
    P[j]=cid+.5+(r-.5)*.8+vec2(sin(uT*.4+r.x*6.),cos(uT*.35+r.y*6.))*.12; }
  for(int j=0;j<9;j++){
    vec2 cid=id+vec2(float(j-(j/3)*3)-1.,float(j/3)-1.); float rr=h21(cid+fl*13.), d=length(g-P[j]);
    c+=mix(uA,uB,rr)*(exp(-d*d*dotS)*(.55+.9*step(.82,rr))+exp(-d*d*dotS*.12)*.07*(1.+fl*.0));                    // point + soft halo
    if(j!=4){ vec2 a=P[4], ba=P[j]-a, pa=g-a; float len=length(ba), hh=clamp(dot(pa,ba)/dot(ba,ba),0.,1.), dl=length(pa-ba*hh);
      float w=smoothstep(1.55,.55,len)*lk; c+=mix(uA,uB,.4)*exp(-dl*dl*linkW)*w*.5;
      if(pk>0.){ float ph=fract(uT*.22+h21(cid+4.4)); float dd=length(g-(a+ba*ph)); c+=vec3(1.)*exp(-dd*dd*(dotS*1.6))*w*pk; } } }
  return c;
}
vec3 scene(vec2 p, vec2 m);
void main(){
  vec2 p=(gl_FragCoord.xy-.5*uR)/uR.y; vec2 m=uM;
  vec3 c=scene(p,m)*uI; c=c/(1.+c*.22);                                 // soft shoulder: highlights roll off instead of clipping
  float S=clamp(max(c.r,max(c.g,c.b)),0.,1.);
  vec3 col = uLight>.5 ? mix(uBg, clamp(c/max(S,.001),0.,1.)*.62, S*.6) : uBg + c;   // light themes: tint toward ink instead of adding light
  col+=(h21(gl_FragCoord.xy+fract(uT)*61.)-.5)/255.*2.;                // dither: no banding in dark gradients
  oc=vec4(col,1.);
}`;

  const SCENES = {
    // curtains of light hanging in 3 depth layers, bright lower edge, vertical rays, a faint horizon glow
    aurora: `vec3 scene(vec2 p, vec2 m){ vec3 c=vec3(0.);
      for(int i=0;i<3;i++){ float fi=float(i), dp=1.+fi*.55; float x=p.x/dp+(m.x-.5)*.14*dp+uT*.012*(1.+fi*.6);
        float w=fbm(vec2(x*1.5,fi*5.1+uT*.04)), y0=.2+.3*w-.08*fi, d=p.y-y0;
        float band=d<0.?exp(d*9.):exp(-d*1.8), rays=.35+.9*pow(fbm(vec2(x*11.+fi*3.,p.y*.8-uT*.12)),1.6);
        c+=mix(uA,uB,clamp(w*1.3+fi*.2,0.,1.))*band*rays*(.64-.15*fi)*smoothstep(-.7,.0,d); }
      c+=uB*.07*exp(-pow((p.y+.6)*2.,2.)); return c; }`,
    // nebula + three star layers: near ones are big soft discs (out of focus), far ones sharp points; cursor parallax per layer
    stars: `vec3 scene(vec2 p, vec2 m){ vec3 c=vec3(0.); vec2 q=p*1.1+(m-.5)*.05;
      float n=fbm(q*1.6+uT*.004), n2=fbm(q*3.2-3.); c+=mix(uA,uB,n2)*pow(n,2.6)*.6*smoothstep(.2,.9,fbm(q*.8+7.));
      for(int l=0;l<3;l++){ float fl=float(l), sc=mix(7.,34.,fl/2.); vec2 g=p*sc+(m-.5)*(3.-fl)*.9+vec2(uT*.012*(2.-fl),0.), id=floor(g), f=fract(g)-.5;
        float r=h21(id+fl*17.); vec2 off=(vec2(h21(id+3.1),h21(id+7.7))-.5)*(fl<.5?.4:.7); float d=length(f-off), rad=mix(.15,.06,fl/2.)*(.4+r);
        float tw=.65+.35*sin(uT*(1.+r*3.)+r*40.), cellfade=1.-smoothstep(.28,.5,max(abs(f.x),abs(f.y))), s=(fl<.5?pow(max(1.-d/(rad*1.3),0.),2.):exp(-d*d/(rad*rad*.14)))*step(.6,r)*tw;
        c+=mix(vec3(1.),mix(uA,uB,r),.55)*s*(fl<.5?.32:fl<1.5?.7:1.1); } return c; }`,
    // glossy liquid: metaball field lit as a height map (diffuse + specular + a bright rim where the surface closes)
    blobs: `float fld(vec2 p){ float f=0.; for(int i=0;i<5;i++){ float fi=float(i); vec2 c=vec2(sin(uT*.13*(1.+fi*.3)+fi*2.1)*.62,cos(uT*.11*(1.+fi*.27)+fi*1.7)*.38); f+=.085/(dot(p-c,p-c)+.02);} return f; }
      vec3 scene(vec2 p, vec2 m){ p+=(m-.5)*.06; float f=fld(p), e=.005; vec2 g=vec2(fld(p+vec2(e,0.))-fld(p-vec2(e,0.)),fld(p+vec2(0.,e))-fld(p-vec2(0.,e)))/(2.*e);
        float inside=smoothstep(1.,1.3,f); vec3 n=normalize(vec3(-g*.02,1.)), L=normalize(vec3(-.5,.6,.65));
        float dif=max(dot(n,L),0.), spec=pow(max(dot(reflect(-L,n),vec3(0,0,1)),0.),48.);
        vec3 base=mix(uA,uB,clamp(f*.3+.25*sin(p.x*2.+uT*.1),0.,1.)); vec3 c=base*(.22+.95*dif)*inside+spec*.9*inside;
        c+=mix(uA,uB,.5)*(exp(-abs(f-1.12)*7.)*.35+.06*smoothstep(.2,1.,f)); return c; }`,
    // volumetric shafts from a light above: rays from noise in angle space, dust motes lit inside the cone, a pool of light on the floor
    beams: `vec3 scene(vec2 p, vec2 m){ vec2 src=vec2((m.x-.5)*.5,.66), d=p-src; float ang=atan(d.x,-d.y), r=length(d);
      float rays=pow(fbm(vec2(ang*7.+uT*.03,3.)),1.4)*1.5+pow(fbm(vec2(ang*19.-uT*.05,9.)),2.)*.8, cone=smoothstep(1.0,.1,abs(ang)), att=exp(-r*1.1);
      float dust=(dustf(p,26.,.1)+dustf(p+3.1,52.,.16)*.8)*2.2*rays*att; vec3 c=mix(uA,uB,.35+.5*sin(ang*3.))*rays*cone*att*.8+vec3(1.)*dust*.7*cone;
      c+=uA*.3*exp(-r*3.2); vec2 fp=vec2((p.x-src.x*.4)/.7,(p.y+.6)/.1); c+=mix(uA,vec3(1.),.5)*exp(-dot(fp,fp))*.5*cone; return c; }`,
    // perspective floor with anti-aliased lines, distance fog, horizon glow and a low sun
    grid: `vec3 scene(vec2 p, vec2 m){ vec3 c=vec3(0.); float hz=-.06+(m.y-.5)*.05, y=hz-p.y;
      if(y>0.){ float z=.4/y; vec2 g=vec2((p.x-(m.x-.5)*.3)*z,z+uT*.7), gr=abs(fract(g-.5)-.5)/fwidth(g); float line=1.-min(min(gr.x,gr.y),1.), fade=smoothstep(0.,.3,y);
        c+=mix(uA,uB,clamp(z*.04,0.,1.))*line*fade*1.2+uB*.05*fade; }
      c+=mix(uB,uA,.5)*exp(-abs(p.y-hz)*10.)*.55*exp(-p.x*p.x*.8)+uA*.2*exp(-length(vec2(p.x*.7,p.y-hz-.1))*2.6); return c; }`,
    // square corridor of light frames flying towards the viewer; cursor moves the vanishing point
    'light-tunnel': `vec3 scene(vec2 p, vec2 m){ p-=(m-.5)*vec2(.2,.16); float d=max(abs(p.x)*.85,abs(p.y)*1.05)+.001, z=.22/d+uT*.55, f=abs(fract(z)-.5);
      float ring=smoothstep(.06,.0,f)+smoothstep(.28,.0,f)*.1; vec3 c=mix(uA,uB,fract(z*.1+.2))*ring*smoothstep(.02,.4,d)*1.3;
      c+=uA*smoothstep(.012,.0,abs(abs(p.x)-abs(p.y)))*.25*smoothstep(.05,.5,d)+mix(uA,uB,.5)*exp(-d*7.)*.9; return c; }`,
    // lit terrain: hill-shaded height map, thin contours every step, thicker index contours every fifth
    topo: `float ht(vec2 q){ return fbm(q*1.6+3.)+.5*fbm(q*3.3); }
      vec3 scene(vec2 p, vec2 m){ vec2 q=p*1.15+vec2(uT*.006,0.); float e=.01, H=ht(q), hx=ht(q+vec2(e,0.)), hy=ht(q+vec2(0.,e));
        vec3 n=normalize(vec3(-(hx-H)/e*.35,-(hy-H)/e*.35,1.)), L=normalize(vec3(-.6+(m.x-.5),.55-(m.y-.5)*.6,.5)); float sh=max(dot(n,L),0.);
        float lv=H*14., w=fwidth(lv), l1=1.-smoothstep(0.,1.4*w,abs(fract(lv-.5)-.5)), l5=1.-smoothstep(0.,2.4*w,abs(fract(lv/5.-.5)-.5)*5.);
        return mix(uA,uB,H*.8)*(l1*.5+l5*.9)*(.35+.9*sh)+mix(uA,uB,H)*sh*.1; }`,
    // discs in three focus planes: near = huge and soft, far = small and crisp with a brighter rim; layers drift in opposite directions
    bokeh: `vec3 scene(vec2 p, vec2 m){ vec3 c=vec3(0.);
      for(int l=0;l<3;l++){ float fl=float(l), sc=mix(3.,9.,fl/2.); vec2 g=p*sc+(m-.5)*(2.-fl)*.9+vec2(uT*.03*(2.-fl),uT*.02*(l==1?1.:-1.)), id=floor(g), f=fract(g)-.5;
        float r1=h21(id+fl*31.), r2=h21(id+9.7+fl), rad=mix(.3,.14,fl/2.)*(.55+r1*.55), soft=mix(.55,.1,fl/2.), d=length(f-(vec2(r1,r2)-.5)*.3);
        float disc=smoothstep(rad,rad*(1.-soft),d), rim=smoothstep(rad*(1.-soft*1.2),rad,d)*smoothstep(rad*1.06,rad,d);
        vec3 cc=r1<.33?uA:(r1<.66?uB:vec3(1.)); c+=cc*(.1*disc+.22*rim)*step(.45,r2)*(.6+.4*sin(uT*.6+r1*30.))*(fl<.5?.7:1.); } return c; }`,
    // flowing colour mesh with a sheen: the luminance field is lit like silk
    'gradient-shift': `vec3 scene(vec2 p, vec2 m){ vec2 q=p*.9+(m-.5)*.1, w=vec2(fbm(q+vec2(0.,uT*.03)),fbm(q+vec2(5.2,1.3)-uT*.02)); q+=2.*(w-.5);
      float a=fbm(q*1.2+3.), b=fbm(q*1.2-5.), e=.01, ax=fbm((q+vec2(e,0.))*1.2+3.), ay=fbm((q+vec2(0.,e))*1.2+3.);
      vec3 n=normalize(vec3((a-ax)/e*.3,(a-ay)/e*.3,1.)); float sp=pow(max(dot(n,normalize(vec3(-.5,.6,.7))),0.),14.);
      return mix(uA,uB,smoothstep(.25,.75,a))*(.3+.85*b)*.95+sp*.28*mix(uA,uB,.5); }`,
    'noise-mesh': `vec3 scene(vec2 p, vec2 m){ vec2 q=p*1.1+(m-.5)*.06; float a=fbm(q*1.4+uT*.01), b=fbm(q*1.4+vec2(8.,3.)-uT*.012), c2=fbm(q*2.6+vec2(2.,5.));
      vec3 c=uA*smoothstep(.35,.8,a)+uB*smoothstep(.35,.8,b)+mix(uA,uB,.5)*smoothstep(.5,.9,c2)*.5; return c*(.45+.55*fbm(q*5.))*.8; }`,
    // a cone of light with dust, a pool on the floor, the cursor aims the lamp
    spotlight: `vec3 scene(vec2 p, vec2 m){ vec2 src=vec2((m.x-.5)*.7,.8), d=p-src; float ang=atan(d.x,-d.y), r=length(d), cone=smoothstep(.42,.12,abs(ang)), att=exp(-r*.85);
      float dust=(dustf(p,22.,.08)+dustf(p+7.3,46.,.14)*.8)*1.5; vec3 c=vec3(1.,.97,.92)*cone*att*(.45+dust)*.75;
      vec2 fp=vec2((p.x-src.x*.55)/.5,(p.y+.58)/.11); c+=mix(uA,vec3(1.),.55)*exp(-dot(fp,fp))*.85*cone+uA*.12*exp(-r*2.5); return c; }`,
    // ranks of lines in perspective: near ones larger and brighter, far ones thin and dim, each with its own wave phase
    'wave-lines': `vec3 scene(vec2 p, vec2 m){ vec3 c=vec3(0.);
      for(int i=0;i<26;i++){ float fi=float(i), z=fi/25., dp=mix(1.,.3,z), x=p.x/dp+(m.x-.5)*.3*(1.-z);
        float wv=sin(x*2.4+uT*.5+fi*.35)*.06+sin(x*5.1-uT*.7+fi*.7)*.025+(fbm(vec2(x*1.6,fi*.4+uT*.1))-.5)*.2, yy=mix(-.58,.08,z)+wv*dp+(m.y-.5)*.05, d=abs(p.y-yy), px=.0032+.0022*(1.-z);
        c+=mix(uB,uA,z)*(exp(-d*d/(px*px))*1.15+exp(-d*d/.0004)*.18)*mix(1.,.22,z); } return c; }`,

    // three graph layers in depth: near = fewer, larger, softer; far = dense, thin, dim; cursor parallax per layer
    network: `vec3 scene(vec2 p, vec2 m){ vec3 c=vec3(0.);
      c+=netL(p,4.2,0.,(m-.5)*1.6,380.,260.,.8,1.)*.7; c+=netL(p,6.8,1.,(m-.5)*.9,700.,520.,.6,1.)*.85; c+=netL(p,11.,2.,(m-.5)*.4,1500.,1100.,0.,.8)*.8;
      c+=mix(uA,uB,.5)*.05*exp(-length(p)*1.6); return c; }`,
    // sparse bright stars with thin lines between near neighbours, tiny background stars
    constellation: `vec3 scene(vec2 p, vec2 m){ vec3 c=netL(p,3.6,0.,(m-.5)*1.1,1700.,160.,0.,.75)*1.3; c+=netL(p+4.7,9.,1.,(m-.5)*.4,3000.,2400.,0.,0.)*.5;
      return c; }`,
    // network with packets travelling along the links and a focal point everything feeds into
    datafield: `vec3 scene(vec2 p, vec2 m){ vec3 c=netL(p,5.2,0.,(m-.5)*1.2,520.,300.,1.2,1.)*.9+netL(p,9.,1.,(m-.5)*.5,1300.,900.,.7,.9)*.7;
      float d=length(p); c+=mix(uA,vec3(1.),.35)*exp(-d*d*20.)*.5+uB*exp(-d*2.6)*.16; return c; }`,
    // three depth layers of falling glyph columns: near = large, soft, slow; far = small, crisp; heads are white
    'code-rain': `vec3 scene(vec2 p, vec2 m){ vec3 c=vec3(0.);
      for(int l=0;l<3;l++){ float fl=float(l), sc=mix(24.,54.,fl/2.); vec2 g=p*vec2(sc*.6,sc)+vec2((m.x-.5)*(2.-fl)*1.2,0.), id=floor(g), f=fract(g);
        float cr=h21(vec2(id.x,fl*9.3)), spd=(.5+cr*1.1)*(1.+fl*.35), s=fract(p.y*(.5+cr*.25)+uT*spd*.2+cr*5.);
        float tr=pow(1.-s,2.6), head=smoothstep(.04,.0,s); vec2 gb=floor(f*vec2(5.,7.)); float bit=step(.58,h21(gb+id*7.1+floor(uT*(1.5+cr*2.)+cr*10.)*.37));
        float msk=step(.14,f.x)*step(f.x,.86)*step(.12,f.y)*step(f.y,.88); bit=mix(bit,.35,mix(.45,.0,fl/2.));
        float act=step(.4,cr); c+=(mix(uA,uB,cr)*bit*msk*tr*(.36-.08*fl)+vec3(1.)*bit*msk*head*(.55-.15*fl))*act; } return c; }`,
    // line-integral convolution: noise averaged along a curl field = silky streaks, two scales for depth
    'flow-field': `vec2 flw(vec2 q){ float a=fbm(q*1.1+uT*.025)*12.566; return vec2(cos(a),sin(a)); }
      vec3 scene(vec2 p, vec2 m){ vec3 c=vec3(0.);
        for(int l=0;l<2;l++){ float fl=float(l); vec2 q=p*(1.5+fl*1.3)+(m-.5)*.4*(1.+fl), s=q; float acc=0.;
          for(int i=0;i<11;i++){ s+=flw(s)*.03; acc+=h21(floor(s*mix(46.,84.,fl)))*(1.-float(i)/11.); }
          acc/=5.2; float st=pow(clamp(acc,0.,1.),4.6); c+=mix(uA,uB,fbm(q*.7+3.))*st*(1.-fl*.35)*(.4+.9*fbm(q*1.3-uT*.02)); } return c*.75; }`,
    // dots on a perspective floor, a travelling swell sets size and brightness, focus plane at mid distance
    'dot-wave': `vec3 scene(vec2 p, vec2 m){ vec3 c=vec3(0.); float hz=-.02+(m.y-.5)*.05, y=hz-p.y;
      if(y>0.){ float z=.36/y; vec2 g=vec2((p.x-(m.x-.5)*.3)*z,z+uT*.4)*2.2, id=floor(g), f=fract(g)-.5; float w=sin(id.x*.3+uT*.9)*cos(id.y*.28-uT*.7)*.5+.5;
        float r=mix(.07,.27,w), soft=.06+abs(z-6.)*.015, d=length(f), dt=smoothstep(r,r-soft,d), fade=smoothstep(0.,.25,y)*exp(-z*.05);
        c+=mix(uB,uA,w)*dt*(.3+1.0*w)*fade*1.4; }
      c+=uB*exp(-abs(p.y-hz)*9.)*.35*exp(-p.x*p.x*.7); return c; }`,
    // five tilted rings in true perspective (ray / plane), satellites on them, brighter when nearer, a glowing core
    orbits: `vec3 scene(vec2 p, vec2 m){ vec3 ro=vec3(0.,0.,3.2), rd=normalize(vec3(p*.9+(m-.5)*.12,-1.6)), c=vec3(0.);
      for(int i=0;i<5;i++){ float fi=float(i), tl=.5+fi*.27+sin(uT*.05+fi)*.07, rt=fi*1.1+uT*.03*(1.+fi*.2);
        vec3 n=normalize(vec3(sin(rt)*sin(tl),cos(tl),cos(rt)*sin(tl))); float t=-dot(ro,n)/dot(rd,n); if(t<0.) continue; vec3 q=ro+rd*t;
        vec3 u=normalize(cross(n,vec3(.001,.002,1.))), v=cross(n,u); vec2 pq=vec2(dot(q,u),dot(q,v)); float r=length(pq), R=.78+fi*.21, dF=clamp(1.7-(t-2.2)*.55,.25,1.5);
        float ring=exp(-pow((r-R)*(52.-fi*3.),2.)), ang=atan(pq.y,pq.x), sa=uT*(.25+fi*.07)*(mod(fi,2.)<1.?1.:-1.)+fi*2.4, da=abs(mod(ang-sa+3.14159,6.28318)-3.14159);
        float sat=exp(-da*da*r*r*700.)*exp(-pow((r-R)*26.,2.)); c+=mix(uA,uB,fi/4.)*(ring*.5+sat*2.4)*dF; }
      float d0=length(p); c+=mix(uA,vec3(1.),.4)*exp(-d0*d0*26.)*.65+uB*exp(-d0*3.)*.15; return c; }`,
    // print dots on a 30 degree screen, size follows a lit gradient (light upper left) that the cursor can brighten
    halftone: `vec3 scene(vec2 p, vec2 m){ mat2 Rm=mat2(.866,-.5,.5,.866); vec2 q=Rm*p*44., id=floor(q), f=fract(q)-.5, cc=transpose(Rm)*((id+.5)/44.);
      float I=.12+.8*smoothstep(-.9,.9,dot(cc,normalize(vec2(-.6,.8))))*(.55+.45*fbm(cc*2.+uT*.03))+.5*exp(-length(cc-(m-.5)*vec2(1.78,1.))*2.4);
      float r=sqrt(clamp(I,0.,1.))*.52, d=length(f); return mix(uA,uB,clamp(I,0.,1.))*smoothstep(r,r-.1,d)*(.35+.9*I); }`
  };

  const VS = `#version 300 es
in vec2 a; void main(){ gl_Position=vec4(a,0.,1.); }`;
  const lum = c => (.2126 * c[0] + .7152 * c[1] + .0722 * c[2]) / 255;

  function make(id) {
    const old = R[id];
    R[id] = {
      init(root, o) {
        const cv = h('canvas'); const gl = cv.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'low-power' });
        const fallback = () => (cv.remove(), old ? old.init(root, o) : { destroy() {} });
        if (!gl) return fallback();
        const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; };
        let pr; try { pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, HEAD + SCENES[id])); gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr)); }
        catch (e) { console.warn('bg shader', id, e.message); return fallback(); }
        root.append(cv); gl.useProgram(pr);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        const U = n => gl.getUniformLocation(pr, n), a = D.rgb('--accent'), b = D.rgb('--accent2', '#2f7bff'), bg = D.rgb('--bg', '#05070d'), light = lum(bg) > .55 ? 1 : 0;
        const I = (o && o.intensity) || 1; let t = 3 + Math.random() * 20, boost = 1, mx = .5, my = .5, tx = .5, ty = .5, raf = 0, alive = true, last = performance.now();
        const size = () => { const s = Math.min(devicePixelRatio || 1, 1.5) * .6; cv.width = Math.max(2, Math.round(innerWidth * s)); cv.height = Math.max(2, Math.round(innerHeight * s)); cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%'; gl.viewport(0, 0, cv.width, cv.height); };
        const pm = e => { tx = e.clientX / innerWidth; ty = 1 - e.clientY / innerHeight; };
        const draw = () => { gl.uniform2f(U('uR'), cv.width, cv.height); gl.uniform2f(U('uM'), mx, my); gl.uniform1f(U('uT'), t); gl.uniform1f(U('uI'), Math.min(1.6, I * 1.25)); gl.uniform1f(U('uLight'), light);
          gl.uniform3f(U('uA'), a[0] / 255, a[1] / 255, a[2] / 255); gl.uniform3f(U('uB'), b[0] / 255, b[1] / 255, b[2] / 255); gl.uniform3f(U('uBg'), bg[0] / 255, bg[1] / 255, bg[2] / 255); gl.drawArrays(gl.TRIANGLES, 0, 3); };
        const frame = now => { if (!alive) return; raf = requestAnimationFrame(frame); const dt = Math.min(.05, (now - last) / 1000); last = now; if (document.hidden) return;
          t += dt * boost; boost += (1 - boost) * Math.min(1, dt * 2.4); const k = 1 - Math.pow(.02, dt); mx += (tx - mx) * k; my += (ty - my) * k; draw(); };
        size(); addEventListener('resize', size); addEventListener('pointermove', pm, { passive: true });
        if (D.reduced) draw(); else raf = requestAnimationFrame(frame);
        return { destroy() { alive = false; cancelAnimationFrame(raf); removeEventListener('resize', size); removeEventListener('pointermove', pm); const x = gl.getExtension('WEBGL_lose_context'); cv.remove(); if (x) x.loseContext(); }, boost(v) { boost = v || 6; } };
      }
    };
  }
  Object.keys(SCENES).forEach(make);
})();
