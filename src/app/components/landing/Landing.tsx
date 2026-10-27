import type { CurveShape } from "@/domain/value-objects/CurveShape";
import { BeatCurve } from "@/app/components/landing/BeatCurve";
import { SignInForm } from "@/app/components/landing/SignInForm";

const CURVES: { shape: CurveShape; title: string; text: string }[] = [
  { shape: "increasing", title: "Croissante", text: "L'intensité monte jusqu'à l'arrivée." },
  { shape: "decreasing", title: "Décroissante", text: "Tu pars fort, tu finis en douceur." },
  { shape: "stable", title: "Stable", text: "Un tempo constant, du début à la fin." },
];

const STEPS = [
  { title: "Connecte-toi", text: "Avec ton compte Spotify." },
  { title: "Choisis ta source", text: "Tes titres likés ou l'une de tes playlists." },
  { title: "Règle ta course", text: "La durée à partir de 10 min, puis la courbe." },
  { title: "Écoute", text: "La playlist est créée dans ton Spotify." },
];

export function Landing() {
  return (
    <div className="lp">
      <div className="lp-container lp-hero">
        <div className="lp-hero__text">
          <h1>Ta prochaine sortie, en rythme.</h1>
          <p className="lp-lead">
            Une playlist qui suit ton intensité, du départ à l&apos;arrivée.
          </p>
          <SignInForm />
        </div>
        <div className="lp-well lp-stage">
          <BeatCurve shape="increasing" count={48} />
          <p className="lp-stage__axis">
            <span>départ</span>
            <span className="lp-axis-mid">BPM, courbe croissante</span>
            <span>arrivée</span>
          </p>
        </div>
      </div>

      <section className="lp-section">
        <div className="lp-container">
          <div className="lp-section__head">
            <h2>Choisis la courbe.</h2>
          </div>
          <div className="lp-curves">
            {CURVES.map(({ shape, title, text }) => (
              <div key={shape} className="lp-well lp-curve">
                <BeatCurve shape={shape} count={24} small />
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="lp-container">
          <div className="lp-section__head">
            <h2>De la connexion à la playlist.</h2>
          </div>
          <ol className="lp-rows">
            {STEPS.map(({ title, text }, index) => (
              <li key={title} className="lp-row">
                <span className="lp-row__n">{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="lp-section">
        <div className="lp-container lp-end">
          <h2>Prends le départ.</h2>
          <SignInForm />
          <p className="lp-muted">Gratuit - Aucune carte requise</p>
        </div>
      </section>
    </div>
  );
}
