"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowDown, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./buki-birthday.module.css";

type Soundscape = {
  context: AudioContext;
  timer: ReturnType<typeof setInterval>;
};

const gallery = [
  {
    src: "/buki/buki-outdoors.webp",
    alt: "HOD Bukkie standing outdoors during a JRB outreach",
    className: styles.portrait,
  },
  {
    src: "/buki/buki-joy.webp",
    alt: "HOD Bukkie laughing with her colleagues",
    className: styles.joy,
  },
  {
    src: "/buki/buki-leading.webp",
    alt: "HOD Bukkie speaking with colleagues during a work visit",
    className: styles.leading,
  },
  {
    src: "/buki/buki-moment.webp",
    alt: "HOD Bukkie in a quiet moment at an event",
    className: styles.moment,
  },
  {
    src: "/buki/buki-conversation.webp",
    alt: "HOD Bukkie in conversation at a formal gathering",
    className: styles.conversation,
  },
  {
    src: "/buki/buki-presence.webp",
    alt: "HOD Bukkie standing thoughtfully with a colleague",
    className: styles.presence,
  },
];

const qualities = [
  ["Thoughtful", "You notice the details—and the people—that others might miss."],
  ["Steady", "Your leadership brings calm, clarity, and confidence when it matters most."],
  ["Joyful", "Your warmth reminds us that excellence and humanity belong together."],
  ["Remarkable", "You set a standard that is felt long after the work is done."],
];

function scheduleChord(
  context: AudioContext,
  destination: AudioNode,
  notes: number[],
  startAt: number
) {
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = index % 2 === 0 ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, startAt);
    oscillator.detune.setValueAtTime(index * 2 - 3, startAt);

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.018, startAt + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 5.8);

    oscillator.connect(gain);
    gain.connect(destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + 6);
  });
}

function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.85, ease: [0.2, 0.75, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function BukiBirthdayExperience() {
  const [opened, setOpened] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const musicRef = useRef<Soundscape | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (!opened) document.body.style.overflow = "hidden";
    else document.body.style.overflow = previousOverflow;

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [opened]);

  useEffect(() => {
    return () => {
      const soundscape = musicRef.current;
      if (!soundscape) return;
      clearInterval(soundscape.timer);
      void soundscape.context.close();
    };
  }, []);

  function startMusic() {
    if (musicRef.current) return;

    const AudioContextClass =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const master = context.createGain();
    const delay = context.createDelay(4);
    const feedback = context.createGain();
    const wet = context.createGain();
    const chords = [
      [261.63, 329.63, 392, 493.88],
      [220, 261.63, 329.63, 392],
      [174.61, 220, 261.63, 329.63],
      [196, 246.94, 293.66, 392],
    ];
    let chordIndex = 0;

    master.gain.setValueAtTime(0.72, context.currentTime);
    delay.delayTime.setValueAtTime(0.72, context.currentTime);
    feedback.gain.setValueAtTime(0.26, context.currentTime);
    wet.gain.setValueAtTime(0.25, context.currentTime);

    master.connect(context.destination);
    master.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(context.destination);

    const playNext = () => {
      scheduleChord(
        context,
        master,
        chords[chordIndex % chords.length],
        context.currentTime + 0.04
      );
      chordIndex += 1;
    };

    playNext();
    const timer = setInterval(playNext, 5200);
    musicRef.current = { context, timer };
    setMusicOn(true);
  }

  function stopMusic() {
    const soundscape = musicRef.current;
    if (!soundscape) return;
    clearInterval(soundscape.timer);
    void soundscape.context.close();
    musicRef.current = null;
    setMusicOn(false);
  }

  function openExperience() {
    startMusic();
    setOpened(true);
  }

  return (
    <main className={`${styles.experience} ${opened ? styles.isOpen : ""}`}>
      <AnimatePresence>
        {!opened ? (
          <motion.div
            className={styles.opening}
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
          >
            <div className={styles.glow} />
            <motion.div
              className={styles.openingInner}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <p className={styles.for}>A little something for</p>
              <div className={styles.monogram} aria-hidden="true">
                B
              </div>
              <h2>HOD Bukkie</h2>
              <p className={styles.date}>September 5</p>
              <Button
                className={styles.openButton}
                size="lg"
                onClick={openExperience}
                autoFocus
              >
                Open your birthday surprise
              </Button>
              <p className={styles.soundNote}>Best experienced with sound</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {opened ? (
        <div className={styles.topRail}>
          <p>For HOD Bukkie · 05.09</p>
          <Button
            className={styles.soundButton}
            variant="ghost"
            size="icon"
            onClick={musicOn ? stopMusic : startMusic}
            aria-label={musicOn ? "Pause ambient music" : "Play ambient music"}
          >
            {musicOn ? <Volume2 /> : <VolumeX />}
          </Button>
        </div>
      ) : null}

      <section
        className={styles.hero}
        aria-label="A birthday message for HOD Bukkie"
        ref={heroRef}
      >
        <motion.div
          className={styles.heroImageWrap}
          style={{ y: prefersReducedMotion ? 0 : heroY }}
        >
          <Image
            className={styles.heroImage}
            src="/buki/buki-hero.webp"
            alt="HOD Bukkie smiling warmly"
            width={1600}
            height={2400}
            unoptimized
            priority
            sizes="100vw"
          />
        </motion.div>
        <div className={styles.heroShade} />
        <motion.div
          className={styles.heroCopy}
          style={{ y: prefersReducedMotion ? 0 : copyY }}
        >
          <p className={styles.kicker}>05 · 09 · 2026</p>
          <h1>
            Happy birthday,
            <span>HOD Bukkie.</span>
          </h1>
          <p className={styles.intro}>
            Today, we celebrate the leader who makes excellence feel human.
          </p>
        </motion.div>
        <div className={styles.scrollCue} aria-hidden="true">
          <ArrowDown />
        </div>
      </section>

      <section className={styles.statement}>
        <Reveal className={styles.statementInner}>
          <p className={styles.sectionLabel}>A quiet truth</p>
          <h2>
            Leadership is more than a position.
            <span>You make it an act of service.</span>
          </h2>
          <p>
            Through your standards, patience, and presence, people feel guided,
            valued, and seen.
          </p>
        </Reveal>
      </section>

      <section className={styles.gallerySection}>
        <Reveal className={styles.galleryHeading}>
          <p className={styles.sectionLabel}>The HOD Bukkie standard</p>
          <h2>Excellence in the work. Grace in the leadership.</h2>
        </Reveal>

        <div className={styles.galleryGrid}>
          {gallery.map((photo, index) => (
            <motion.figure
              className={`${styles.galleryPhoto} ${photo.className}`}
              key={photo.src}
              initial={{ opacity: 0, y: 45 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.14 }}
              transition={{
                duration: 0.8,
                delay: (index % 3) * 0.08,
                ease: [0.2, 0.75, 0.2, 1],
              }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={1600}
                height={2400}
                unoptimized
                sizes="(max-width: 720px) 92vw, 50vw"
              />
            </motion.figure>
          ))}
        </div>

        <Reveal className={styles.galleryNote}>
          <span>Not just present.</span>
          <strong>Fully there.</strong>
        </Reveal>
      </section>

      <section className={styles.teamMoment}>
        <Image
          className={styles.teamImage}
          src="/buki/buki-team.webp"
          alt="HOD Bukkie together with the JRB team"
          width={2400}
          height={1600}
          unoptimized
          sizes="100vw"
        />
        <div className={styles.teamShade} />
        <Reveal className={styles.teamCopy}>
          <p className={styles.sectionLabel}>The culture you create</p>
          <h2>A team that can excel—and still feel human.</h2>
          <p>
            In the deadlines, the questions, and the busy days, your leadership
            reminds us that strong results and genuine care belong together.
          </p>
        </Reveal>
      </section>

      <section className={styles.qualitiesSection}>
        <div className={styles.qualitiesIntro}>
          <p className={styles.sectionLabel}>Why you are appreciated</p>
          <h2>The things that numbers could never quite measure.</h2>
        </div>
        <div className={styles.qualitiesList}>
          {qualities.map(([quality, note], index) => (
            <motion.article
              className={styles.quality}
              key={quality}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.65, delay: index * 0.05 }}
            >
              <span>0{index + 1}</span>
              <h3>{quality}</h3>
              <p>{note}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className={styles.letterSection}>
        <Reveal className={styles.letter}>
          <p className={styles.letterDate}>September 5, 2026</p>
          <h2>Dear HOD Bukkie,</h2>
          <div className={styles.letterBody}>
            <p>
              Thank you for the wisdom, warmth, and steady leadership you bring
              into every room.
            </p>
            <p>
              For every decision you carry with grace, every question you meet
              with patience, and every person you make time for—your impact is
              greater than words can properly measure.
            </p>
            <p>
              Today, we celebrate not only the exceptional HOD you are, but the
              remarkable person behind the title. You lead with strength
              without losing softness, and with excellence without losing
              humanity.
            </p>
            <p>
              May this new year return your kindness in abundance, surprise you
              with beautiful moments, and give you countless reasons to wear
              that unforgettable smile.
            </p>
          </div>
          <div className={styles.signature}>
            <span>With respect, love, and deep appreciation,</span>
            <strong>Your JRB family</strong>
          </div>
        </Reveal>
      </section>

      <section className={styles.finale}>
        <Image
          className={styles.finaleImage}
          src="/buki/buki-formal.webp"
          alt="HOD Bukkie at a JRB gathering"
          width={1600}
          height={2400}
          unoptimized
          sizes="100vw"
        />
        <div className={styles.finaleShade} />
        <Reveal className={styles.finaleCopy}>
          <p className={styles.sectionLabel}>One wish</p>
          <h2>This year, may life celebrate you back.</h2>
          <p>Happy birthday, HOD Bukkie.</p>
        </Reveal>
        <div className={styles.marquee} aria-hidden="true">
          <div>
            HAPPY BIRTHDAY HOD BUKKIE&nbsp; · &nbsp;HAPPY BIRTHDAY HOD BUKKIE&nbsp; · &nbsp;
            HAPPY BIRTHDAY HOD BUKKIE&nbsp; · &nbsp;
          </div>
        </div>
      </section>
    </main>
  );
}
