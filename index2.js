function startMatrix(canvasId) {
      const canvas = document.getElementById(canvasId);
      const ctx = canvas.getContext("2d");

      const fontSize = 14;
      let columns = Math.floor(canvas.width / fontSize);
      let drops = new Array(columns).fill(1);
      const binary = "01";

      function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        columns = Math.floor(canvas.width / fontSize);
        drops = new Array(columns).fill(1);
      }

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      function draw() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0f0";
        ctx.font = fontSize + "px monospace";

        for (let i = 0; i < drops.length; i++) {
          const text = binary[Math.floor(Math.random() * binary.length)];
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);

          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      }

      setInterval(draw, 40);
    }

    startMatrix("matrixHeader");
    startMatrix("matrixFooter");

    // Menu hamburguer toggle seguro
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const dropdown = document.getElementById("dropdown");

  if (hamburger && dropdown) {
    hamburger.addEventListener("click", () => {
      dropdown.classList.toggle("active");
    });

    // Fecha o dropdown se clicar fora dele ou do hambúrguer
    document.addEventListener("click", (e) => {
      if (!hamburger.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove("active");
      }
    });
  }
});


function copyDescription() {
  const text = document.getElementById("modalDescription").textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert("Copiado para a área de transferência!");
  }).catch(err => {
    alert("Erro ao copiar: " + err);
  });
}