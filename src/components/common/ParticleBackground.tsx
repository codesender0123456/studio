"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type ParticleBackgroundProps = {
    className?: string;
};

export default function ParticleBackground({ className }: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticles();
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() * 2 - 1) * 0.2;
        this.speedY = (Math.random() * 2 - 1) * 0.2;
      }

      update() {
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;

        let dx = mouse.current.x - this.x;
        let dy = mouse.current.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let force = (100 - distance) / 100 * 0.5;
            this.x -= forceDirectionX * force;
            this.y -= forceDirectionY * force;
        }

        this.x += this.speedX;
        this.y += this.speedY;
      }

      draw() {
        ctx!.fillStyle = "hsl(170 100% 50% / 0.5)";
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    const createParticles = () => {
        particles = [];
        let numberOfParticles = (canvas.width * canvas.height) / 9000;
        for (let i = 0; i < numberOfParticles; i++) {
            particles.push(new Particle());
        }
    };
    
    const handleParticles = () => {
        for(let i = 0; i < particles.length; i++){
            particles[i].update();
            particles[i].draw();

            for(let j = i; j < particles.length; j++){
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if(distance < 100){
                    ctx!.beginPath();
                    ctx!.strokeStyle = `hsl(170 100% 50% / ${1 - distance/100})`;
                    ctx!.lineWidth = 0.2;
                    ctx!.moveTo(particles[i].x, particles[i].y);
                    ctx!.lineTo(particles[j].x, particles[j].y);
                    ctx!.stroke();
                    ctx!.closePath();
                }
            }
        }
    }

    const animate = () => {
      ctx!.clearRect(0, 0, canvas.width, canvas.height);
      handleParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (event: MouseEvent) => {
        mouse.current.x = event.x;
        mouse.current.y = event.y;
    }
    
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);

    resizeCanvas();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className={cn("bg-transparent", className)} />;
}
