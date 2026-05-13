// Subtle parallax tilt on laptop mockups
const laptops = document.querySelectorAll('.laptop--floating');
laptops.forEach((el) => {
  const lid = el.querySelector('.laptop__lid');
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    const ry = (-x * 14).toFixed(2);
    const rx = (6 + y * 4).toFixed(2);
    lid.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${(-x*1.5).toFixed(2)}deg)`;
  });
  el.addEventListener('mouseleave', () => { lid.style.transform = ''; });
});

// Pause videos when not in viewport (save CPU)
const vids = document.querySelectorAll('video');
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const v = entry.target;
    if (entry.isIntersecting) v.play().catch(()=>{});
    else v.pause();
  });
}, { threshold: 0.25 });
vids.forEach((v) => io.observe(v));
