document.querySelectorAll('[data-target]').forEach(button=>{
  button.addEventListener('click',()=>{
    const targetId = button.getAttribute('data-target');
    document.getElementById(targetId).scrollIntoView({behavior:'smooth'});
  });
});