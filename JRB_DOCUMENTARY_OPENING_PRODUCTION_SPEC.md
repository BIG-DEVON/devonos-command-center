# JRB Documentary Opening — Production Specification

This document replaces the earlier short prompt. It is intentionally exhaustive. The two JSON blocks are separate production specifications: the first controls the approved 4K starting frame; the second controls an eight-second, 192-frame animation at 24fps.

## Non-negotiable production principle

The supplied `jrb_logo.png` is an official source asset, not a visual reference for an AI model to imitate. Generate the environment separately, extract the source background deterministically, then composite the original logo pixels as a protected layer. If a tool cannot guarantee that separation, do not let it render the logo.

The source inspected for this specification is 1600×546 pixels and has no alpha channel. The official mark, organisation name, and tagline must therefore be isolated without generative reconstruction, inpainting, retyping, vector tracing, or logo “enhancement.”

## Production files

- [Master starting-image JSON specification](./JRB_STARTING_IMAGE_SPEC.md)
- [Eight-second animation JSON specification](./JRB_ANIMATION_SPEC.md)
- [Mr Effiong's locked short-video structure and editor execution brief](./JRB_SHORT_VIDEO_EDITOR_BRIEF.md)

The two visual specifications intentionally use the same native 1600×546 logo asset, the same deterministic alpha extraction, the same 3840×2160 master canvas, and the same hero placement at `x=1120`, `y=807`. The animation resolves into the static master rather than inventing a second visual direction.
