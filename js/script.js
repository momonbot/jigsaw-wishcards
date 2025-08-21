/*  main.js – Love-Puzzle + Confetti
 *  Requires GSAP 3 + Draggable (đã load trong HTML)
 *  Drop file này vào /js/main.js
 */
"use strict";

/* ───────────────────────────────── P U Z Z L E ───────────────────────────────── */

const puzzle     = document.querySelector(".puzzle");
const pieces     = document.querySelector(".pieces");
const paths      = document.querySelectorAll(".puzzle path");
const endImg     = document.querySelector(".endImg");
const cardStack  = document.querySelector(".card-stack");   // section thẻ “card-stack”
const kittens = window.KITTENS || [
  "https://images.unsplash.com/photo-1587996833651-06a23343b15d",
  "https://images.unsplash.com/photo-1597626259989-a11e97b7772d",
  "https://images.unsplash.com/photo-1615497001839-b0a0eac3274c",
  "https://images.unsplash.com/photo-1566847438217-76e82d383f84",
  "https://images.unsplash.com/photo-1570018144715-43110363d70a",
  "https://images.unsplash.com/photo-1561948955-570b270e7c36",
  "https://plus.unsplash.com/premium_photo-1677545183884-421157b2da02",
  "https://images.unsplash.com/photo-1573865526739-10659fec78a5"
];

/* Vị trí start ngẫu nhiên của từng miếng */
const startPos = [
  { x: 164, y:  56 }, { x:  77, y: -35 }, { x: -98, y: -23 }, { x: -57, y: 105 },
  { x: -168, y: 39 }, { x: -33, y:  -5 }, { x: -38, y: -60 }, { x: -122,y:  71 },
  { x:  91, y: -13 }, { x:  35, y:  -5 }, { x: -38, y:  16 }, { x:   8, y: -88 },
  { x:  81, y:   4 }, { x:  62, y: -66 }, { x: -174,y: -45 }, { x: 101, y:  36 },
  { x:  38, y:  33 }, { x: -80, y:  29 }, { x:  -7, y: -106}, { x:  42, y:  19 }
];

/* Flag hoàn thành */
let solved = false;

/* Tạo từng mảnh & Draggable */
paths.forEach((p, i) => {
  const piece   = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const shadow  = p.cloneNode(true);
  pieces.append(piece);
  piece.append(shadow, p);

  gsap.set(piece, {
    transformOrigin: "50%",
    x: startPos[i].x,
    y: startPos[i].y,
    rotate: "random(-25,25)",
    attr: { class: "piece" }
  });
  gsap.set(shadow, { opacity: 0.35 });
  gsap.set(p,      { attr: { fill: "url(#img)", filter: "url(#bevel)" } });

  Draggable.create(piece, {
    onPress() {
      gsap
        .timeline({ defaults: { duration: 0.3 } })
        .to(piece,  { scale: 1.1, rotate: "random(-5,5)", ease: "back.out(3)" }, 0)
        .to(shadow, { x: 1, y: 5, opacity: 0.15, scale: 0.9, ease: "back.out(1)" }, 0);
      pieces.append(piece);
    },
    onRelease() {
      gsap
        .timeline({ defaults: { duration: 0.2 } })
        .to(piece,  { scale: 1, ease: "back.out(3)" }, 0)
        .to(shadow, { opacity: 0.35, x: 0, y: 0, scale: 1, ease: "power2" }, 0)
        .add(check);

      /* Snap nhẹ nếu gần vị trí (0,0) */
      if (Math.abs(gsap.getProperty(piece, "x")) < 9 &&
          Math.abs(gsap.getProperty(piece, "y")) < 9) {
        gsap.to(piece, { duration: 0.2, x: 0, y: 0, rotate: 0 });
      }
    }
  });
});

/* Kiểm tra ghép xong hay chưa */
function check() {
  if (solved) return;                     // đã xử lý rồi

  let n = 0;
  document.querySelectorAll(".piece").forEach((p) => {
    n += Math.abs(gsap.getProperty(p, "x")) + Math.abs(gsap.getProperty(p, "y"));
  });

  if (n < 1) {                            // đã khớp hoàn toàn
    solved = true;
    puzzle.append(endImg);

    gsap.to(endImg, {
      duration: 1,
      opacity : 1,
      ease    : "power2.inOut",
      onComplete: startConfetti          // 🎉 gọi confetti
    });
  }
}

/* Một vài setup ban đầu */
gsap.set(".endImg, .box, .pieces", { x: 82.5, y: 50 });
gsap.set("body", { background: `hsl(${gsap.utils.random(0,360)}, 70%, 80%)` });
gsap.set("#imgSrc", {
  attr: { href: `${kittens[gsap.utils.random(0, kittens.length - 1, 1)]}?q=50&w=2000` }
});

/* ─────────────────────────────── C O N F E T T I ────────────────────────────── */
/*  Original by @scrimothy – wrap thành startConfetti() để tái sử dụng          */

function startConfetti() {
  /* ——— Helpers & constants ——— */
  const random = Math.random, cos = Math.cos, sin = Math.sin,
        PI = Math.PI, PI2 = PI * 2;

  let timer, frame;
  const confetti = [];
  const spread = 40, sizeMin = 3, sizeMax = 12 - sizeMin,
        eccentricity = 10, deviation = 100,
        dxThetaMin = -.1, dxThetaMax = .2,
        dyMin = .13,  dyMax = .18,
        dThetaMin = .4, dThetaMax = .3;

  /* Colour palettes */
  const colorThemes = [
    () => color(random()*200|0, random()*200|0, random()*200|0),
    () => { const b = random()*200|0; return color(200, b, b); },
    () => { const b = random()*200|0; return color(b, 200, b); },
    () => { const b = random()*200|0; return color(b, b, 200); },
    () => color(200, 100, random()*200|0),
    () => color(random()*200|0, 200, 200),
    () => { const b = random()*256|0; return color(b, b, b); },
    () => (random() < .5 ? colorThemes[1]() : colorThemes[2]()),
    () => (random() < .5 ? colorThemes[3]() : colorThemes[5]()),
    () => (random() < .5 ? colorThemes[2]() : colorThemes[4]())
  ];
  function color(r,g,b){ return `rgb(${r},${g},${b})`; }

  /* Cosine interpolation */
  const interpolation = (a,b,t)=> (1-cos(PI*t))/2*(b-a)+a;

  /* 1-D Poisson disc */
  const radius=1/eccentricity, radius2=radius*2;
  function createPoisson(){
    const domain=[radius,1-radius]; let measure=1-radius2, spline=[0,1];
    while(measure){
      let dart=measure*random(), i,l,interval,a,b,c,d;
      for(i=0,l=domain.length,measure=0;i<l;i+=2){
        a=domain[i];b=domain[i+1];interval=b-a;
        if(dart<measure+interval){spline.push(dart+=a-measure);break;}
        measure+=interval;
      }
      c=dart-radius;d=dart+radius;
      for(i=domain.length-1;i>0;i-=2){
        l=i-1;a=domain[l];b=domain[i];
        if(a>=c&&a<d)(b>d)?domain[l]=d:domain.splice(l,2);
        else if(a<c&&b>c)(b<=d)?domain[i]=c:domain.splice(i,0,c,d);
      }
      for(i=0,l=domain.length,measure=0;i<l;i+=2)measure+=domain[i+1]-domain[i];
    }
    return spline.sort();
  }

  /* DOM container */
  const container=document.createElement('div');
  Object.assign(container.style,{
    position:'fixed',top:0,left:0,width:'100%',height:0,overflow:'visible',zIndex:9999
  });

  /* Confetto class */
  function Confetto(theme){
    this.frame=0;
    this.outer=document.createElement('div');
    this.inner=document.createElement('div');
    this.outer.appendChild(this.inner);
    const o=this.outer.style, s=this.inner.style;

    o.position='absolute';
    o.width =(sizeMin+sizeMax*random())+'px';
    o.height=(sizeMin+sizeMax*random())+'px';
    s.width='100%'; s.height='100%'; s.backgroundColor=theme();

    o.perspective='50px';
    o.transform=`rotate(${360*random()}deg)`;
    this.axis=`rotate3D(${cos(360*random())},${cos(360*random())},0,`;
    this.theta=360*random();
    this.dTheta=dThetaMin+dThetaMax*random();
    s.transform=this.axis+this.theta+'deg)';

    this.x=window.innerWidth*random(); this.y=-deviation;
    this.dx=sin(dxThetaMin+dxThetaMax*random());
    this.dy=dyMin+dyMax*random();
    o.left=this.x+'px'; o.top=this.y+'px';

    this.splineX=createPoisson();
    this.splineY=[]; for(let i=1,l=this.splineX.length-1;i<l;++i)
      this.splineY[i]=deviation*random();
    this.splineY[0]=this.splineY[this.splineX.length-1]=deviation*random();

    this.update=(height,delta)=>{
      this.frame+=delta; this.x+=this.dx*delta; this.y+=this.dy*delta;
      this.theta+=this.dTheta*delta;

      let phi=this.frame%7777/7777,i=0,j=1;
      while(phi>=this.splineX[j])i=j++;
      const rho=interpolation(
        this.splineY[i],this.splineY[j],
        (phi-this.splineX[i])/(this.splineX[j]-this.splineX[i])
      );
      phi*=PI2;
      o.left=this.x+rho*cos(phi)+'px';
      o.top =this.y+rho*sin(phi)+'px';
      s.transform=this.axis+this.theta+'deg)';
      return this.y>height+deviation;
    };
  }

  /* Launch burst */
  (function poof(){
    if(frame)return;
    document.body.appendChild(container);
    const theme=colorThemes[0];

    (function addConfetto(){
      const confetto=new Confetto(theme);
      confetti.push(confetto);
      container.appendChild(confetto.outer);
      timer=setTimeout(addConfetto, spread*random());
    })();

    let prev;
    (function loop(t){
      const delta=prev? t-prev : 0; prev=t;
      const height=window.innerHeight;
      for(let i=confetti.length-1;i>=0;--i){
        if(confetti[i].update(height,delta)){
          container.removeChild(confetti[i].outer);
          confetti.splice(i,1);
        }
      }
      if(timer||confetti.length){frame=requestAnimationFrame(loop);}
      else{container.remove(); frame=undefined;}
    })(0);

    /* Sau 2 s: dừng confetti + ẩn puzzle + hiện card-stack */
    setTimeout(()=>{
      clearTimeout(timer); timer=null;
      frame && cancelAnimationFrame(frame);
      container.remove();

      puzzle.classList.add("is-hidden");
      cardStack && cardStack.classList.remove("is-hidden");
    }, 2000);   // 2 000 ms
  })();
}