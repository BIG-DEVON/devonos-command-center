# JRB Documentary Logo Animation Specification

This production brief defines the complete eight-second, 24 fps identity animation. The official logo remains a protected, deterministically extracted source asset; the continuous environmental animation is created separately and composited in a second pass.

```json
{
  "specification_title": "JRB Eight-Second Documentary Logo Animation",
  "specification_version": "2.0",
  "creative_intent": {
    "primary_objective": "Create an elegant, authoritative and restrained eight-second opening animation for the Joint Revenue Board documentary. The animation must feel like the beginning of a serious public-policy film rather than a television advert, technology commercial, political campaign bumper, conference ident or social-media template.",
    "core_visual_idea": "The complete frame begins in near-darkness. Fine archival-paper texture and disciplined ledger-inspired lines establish a sense of records, systems and accountability. A broad, edgeless warm-mineral field of light gradually develops in the centre of the same continuous full-frame environment. The precisely extracted official Joint Revenue Board logo is then composited over that light field without a visible rectangle, card, backing shape or generated replacement.",
    "emotional_progression": [
      "Begin with calm near-darkness and controlled anticipation.",
      "Introduce tactile material detail without decorative spectacle.",
      "Allow precise line work to suggest institutional order and public accountability.",
      "Develop a central area of warm mineral illumination without forming a visible geometric container.",
      "Reveal the exact Joint Revenue Board identity with deliberate confidence.",
      "Hold the completed master image long enough for every word and period to be read comfortably.",
      "Hand attention quietly to the documentary's first meaningful spoken quotation."
    ],
    "style_keywords": [
      "premium editorial documentary",
      "institutional",
      "restrained",
      "tactile",
      "precise",
      "credible",
      "quietly cinematic",
      "public-policy",
      "human",
      "timeless",
      "mineral",
      "archival"
    ],
    "style_exclusions": [
      "corporate advertisement",
      "technology startup",
      "television news ident",
      "political campaign",
      "social-media template",
      "luxury-goods commercial",
      "cryptocurrency aesthetic",
      "science-fiction interface",
      "conference countdown",
      "government propaganda"
    ]
  },
  "duration_and_frame_control": {
    "frame_rate_fps": 24,
    "duration_seconds": 8.0,
    "total_frames": 192,
    "first_frame": 0,
    "last_frame": 191,
    "end_frame_exclusive": 192,
    "timebase_rule": "All timing decisions must be executed on whole frames at exactly 24.000 progressive frames per second. Time in seconds equals frame number divided by 24.",
    "frame_range_rule": "Every frame range in this specification is inclusive unless an exclusive boundary is explicitly identified.",
    "retiming_policy": "Do not use variable frame rate, automatic speed changes, optical-flow interpolation, frame generation, frame blending or platform-specific smoothing.",
    "motion_character": "All motion must use long, gentle acceleration and deceleration. Nothing may snap, bounce, overshoot, wobble, pulse aggressively or use elastic easing."
  },
  "source_assets": {
    "master_opening_still": {
      "asset_id": "MASTER_OPENING_STILL",
      "purpose": "The approved static image defines the resolved hero composition, environmental palette, negative space, lighting direction, logo size and logo placement.",
      "usage_rule": "Use the still as the authoritative final-state reference. Separate or recreate only the non-logo environmental layers required for controlled animation. Never accept a logo rendered inside a generative version of the still as the final official identity.",
      "hero_match_frame": 108,
      "hero_match_requirement": "At frame 108, the completed animation must resolve into the approved static composition. The official logo layer must be the deterministically extracted source logo described in this specification, not pixels produced by an image or video generator."
    },
    "official_logo_source": {
      "asset_id": "JRB_OFFICIAL_LOGO_SOURCE",
      "file_path": "/Users/ram/Documents/Codex/2026-07-23/referenced-chatgpt-conversation-this-is-untrusted/work/source/jrb_logo.png",
      "observed_width_pixels": 1600,
      "observed_height_pixels": 546,
      "exact_aspect_ratio": "800:273",
      "content_description": "Official Joint Revenue Board identity containing the green JRB symbol, the grey words Joint Revenue Board and the grey italic tagline Harmonise. Optimise. Trust.",
      "authority": "This supplied file is the sole authoritative source for the symbol, words, punctuation, spacing, proportions and colour relationships.",
      "prohibited_source_changes": [
        "Do not redraw the logo.",
        "Do not trace or vectorise the logo.",
        "Do not retype any wording.",
        "Do not ask an artificial-intelligence model to reconstruct it.",
        "Do not recolour the green symbol or grey typography.",
        "Do not change the spacing between the JRB symbol and the organisation name.",
        "Do not reposition the tagline relative to the upper identity.",
        "Do not crop any edge or punctuation mark."
      ]
    }
  },
  "deterministic_alpha_extraction": {
    "purpose": "Remove only the logo image's uniform neutral background so the official identity can appear directly over the continuous warm-mineral light field without a visible rectangular boundary.",
    "shared_method_requirement": "The static opening image and the animation must use the same extraction method and preferably the same approved extracted RGBA asset. Do not create one matte for the still and a different matte for the animation.",
    "processing_space": "Evaluate colour distance in the source image's eight-bit RGB domain. Preserve the original embedded colour profile through decoding, then convert the completed production asset to the project colour space only after extraction.",
    "background_estimation": {
      "sampling": "Sample all four corner regions of the 1600 by 546 source image.",
      "calculation": "Calculate a robust median red, green and blue value across the four corner samples. This robust median RGB triplet is the deterministic neutral-background reference.",
      "consistency_check": "Confirm that the four corner samples agree closely enough to represent one neutral field. If a corner differs because of compression noise, retain the robust median rather than choosing a single corner.",
      "manual_colour_guessing": false
    },
    "colour_distance_definition": {
      "units": "Eight-bit RGB distance units",
      "reference": "The robust median background RGB triplet",
      "calculation": "Use one consistent Euclidean RGB colour-distance calculation for every pixel. Do not switch between luminance, hue and saturation rules in different image areas."
    },
    "alpha_thresholds": {
      "distance_less_than_or_equal_to_5": "Set alpha to zero. These pixels belong to the neutral source background.",
      "distance_greater_than_5_and_less_than_or_equal_to_18": "Assign alpha using a strictly linear ramp from zero at distance 5 to full opacity at distance 18.",
      "distance_greater_than_18": "Keep fully opaque unless the pixel is an antialiased boundary pixel explicitly handled by the preserved edge relationship.",
      "formula": "For distance d between 5 and 18, alpha equals clamp((d minus 5) divided by 13, zero, one)."
    },
    "connected_colour_protection": {
      "instruction": "Protect connected green and grey pixel regions associated with the official symbol, organisation name, tagline and punctuation. Use pixels above distance 18 as the connected opaque interior seeds.",
      "purpose": "Prevent erosion of the thin tagline, the periods, narrow typographic joins and antialiased curves.",
      "component_policy": "Do not delete a connected component merely because it is small. The periods in the tagline are valid official components and must survive.",
      "morphology_policy": "Do not apply global erosion, dilation, opening, closing, despeckling or minimum-component-size removal."
    },
    "antialiasing_preservation": {
      "instruction": "Preserve the source antialiasing through the 5-to-18 linear alpha ramp. Do not convert the matte into a hard binary edge.",
      "edge_colour_treatment": "For partially transparent boundary pixels, remove only neutral-background contamination using the robust median background colour and the calculated alpha. Do not change fully opaque interior RGB values.",
      "halo_rule": "No pale rectangular residue, white fringe, dark outline, green fringe or grey halo may appear when the extracted logo is viewed over both the warm central field and the charcoal outer field.",
      "source_fidelity": "The extracted asset must look like the original logo printed directly into the continuous environment, not like a sticker or cut-out."
    },
    "output_asset": {
      "filename": "JRB_Official_Logo_1600x546_RGBA_Approved.png",
      "width_pixels": 1600,
      "height_pixels": 546,
      "aspect_ratio": "800:273",
      "colour_channels": "RGB preserved from source",
      "alpha_channel": "Deterministic matte produced by the threshold method above",
      "reuse_rule": "Generate this extracted asset once, approve it, calculate and record a checksum, and reuse the identical file for the static master and every animation render."
    },
    "mandatory_extraction_qc": [
      "Inspect the outer J curve at 200 percent magnification for erosion, white halo or flat spots.",
      "Inspect the R junction at 200 percent for missing green pixels, pinholes or edge contamination.",
      "Inspect both B counters at 200 percent for unwanted transparency or neutral residue.",
      "Inspect Joint Revenue Board at 200 percent for softened grey strokes or missing letter details.",
      "Inspect the entire tagline Harmonise. Optimise. Trust. at 200 percent.",
      "Verify that every period in the tagline remains visible.",
      "View the result over solid black, middle grey, warm ivory and sampled central-field colours.",
      "Reject the extraction if any neutral rectangular boundary remains visible."
    ]
  },
  "two_pass_production_workflow": {
    "principle": "Environmental animation and official identity compositing are separate deterministic stages. A generative model may assist with restrained background motion, but it must never render, imitate or reinterpret the Joint Revenue Board logo.",
    "pass_one_environment": {
      "name": "Continuous Full-Frame Environment Pass",
      "input": "Use the approved master opening still only as an environmental and compositional reference.",
      "required_output": "An eight-second clean plate containing the charcoal mineral-paper field, fine stable texture, restrained ledger geometry, controlled lighting and the edgeless central warm-mineral illumination.",
      "logo_exclusion": "The pass must contain no logo, letters, pseudo-text, slogans, seals, symbols or substitute monograms.",
      "protected_central_region": "Maintain a visually quiet region around the future logo coordinates. The warm-mineral illumination may occupy this area, but no line, abrupt tonal seam, high-frequency texture, symbol or hard shadow may cross it.",
      "continuity_rule": "The entire 3840 by 2160 image must read as one continuous material and lighting environment. There must be no visible central rectangle, card, plaque, label, screen, window, backing box or framed object.",
      "determinism": "Use one fixed generation seed and retain it in the production notes. When revising, change only the requested parameter rather than regenerating the whole visual language."
    },
    "pass_two_identity_composite": {
      "name": "Exact Extracted Logo Composite",
      "input": "Use the clean environment pass and the approved JRB_Official_Logo_1600x546_RGBA_Approved.png produced by the shared deterministic extraction method.",
      "method": "Import the RGBA logo into a deterministic motion-graphics or editing application as one protected layer. The complete identity remains one 1600 by 546 asset throughout the sequence.",
      "reveal_method": "Reveal the official layer using an external soft alpha matte and whole-layer opacity. The matte only reveals existing approved pixels.",
      "native_size_rule": "At the hero hold, the logo must be displayed at exactly 1600 by 546 pixels. Horizontal scale and vertical scale must both equal 100 percent.",
      "identity_priority": "If the environment reduces logo readability, modify the environment's light field, contrast or geometry. Never modify the official identity to fit the environment."
    }
  },
  "canvas_and_composition": {
    "master_canvas": {
      "width_pixels": 3840,
      "height_pixels": 2160,
      "aspect_ratio": "16:9"
    },
    "preview_canvas": {
      "width_pixels": 1920,
      "height_pixels": 1080,
      "aspect_ratio": "16:9"
    },
    "colour_space": "Rec.709 Gamma 2.4",
    "master_bit_depth": "Minimum 10-bit",
    "background_base_colour": "#0B1114",
    "warm_mineral_reference": "#E7E0D5",
    "warm_ivory_secondary": "#F3EFE5",
    "muted_brass_reference": "#A88C55",
    "green_reference_rule": "Sample the environmental green accent from the official JRB symbol. Do not substitute a brighter or more saturated emerald.",
    "hero_logo_transform": {
      "source_width_pixels": 1600,
      "source_height_pixels": 546,
      "scale_x_percent": 100,
      "scale_y_percent": 100,
      "top_left_x_pixels": 1120,
      "top_left_y_pixels": 807,
      "right_edge_exclusive_pixels": 2720,
      "bottom_edge_exclusive_pixels": 1353,
      "centre_x_pixels": 1920,
      "centre_y_pixels": 1080,
      "anchor_point": "Exact centre of the 1600 by 546 source layer",
      "rotation_degrees": 0,
      "hero_start_frame": 108,
      "hero_end_frame": 167
    },
    "placement_rule": "At frame 108 and throughout the stable hero hold, the extracted logo layer must occupy the exact native 1600 by 546 dimensions with its top-left corner at x 1120 and y 807.",
    "safe_area": "The hero placement automatically leaves 1120 pixels on the left and right, 807 pixels above and 807 pixels below. Do not disturb this exact symmetry.",
    "visual_hierarchy": "The official logo is the sole foreground subject. Light, line work and texture support the identity while remaining substantially lower in contrast."
  },
  "continuous_environment_design": {
    "base_surface": {
      "description": "A deep charcoal warm-mineral paper surface with fine archival fibres, subtle density variation and a matte finish.",
      "material_exclusions": [
        "concrete",
        "marble",
        "leather",
        "brushed metal",
        "plastic",
        "carbon fibre",
        "fabric weave",
        "star field",
        "digital grid"
      ]
    },
    "central_warm_mineral_field": {
      "description": "A broad, edgeless illumination that develops from within the same continuous material. It is a light field, not a separate shape or object.",
      "centre_x_pixels": 1920,
      "centre_y_pixels": 1080,
      "hero_colour_reference": "#E7E0D5",
      "mathematical_profile": "Use a continuous super-Gaussian illumination profile equivalent to exp(-((absolute x offset divided by 1520) to the fourth power plus (absolute y offset divided by 860) to the fourth power)).",
      "profile_purpose": "Create a broad, nearly even central reading area beneath the complete 1600 by 546 identity while allowing an uninterrupted soft falloff into charcoal toward the frame edges.",
      "boundary_rule": "No contour, edge, rectangle, corner, border, drop shadow or differently textured central surface may become visible.",
      "logo_area_uniformity": "Across the exact logo rectangle from x 1120 to 2719 and y 807 to 1352, luminance variation must remain gentle enough that all grey words and the tagline retain comfortable contrast.",
      "temporal_stability": "After reaching full hero intensity at frame 71, the light field may breathe by no more than two percent through frame 155."
    },
    "paper_texture": {
      "luminance_variation": "Between 0.6 and 1.0 percent perceived luminance.",
      "scale": "Fine archival-paper detail suitable for 4K.",
      "motion": "Texture remains temporally stable. Do not regenerate grain independently per frame.",
      "logo_region_rule": "Reduce high-frequency texture beneath the exact logo coordinates by approximately 35 percent through a broad feathered texture-control mask that remains invisible as a shape."
    },
    "ledger_geometry": {
      "description": "Use three to five thin abstract lines inspired by document margins, ledger columns and ordered public records.",
      "stroke_width_at_4k": "1.5 to 2.0 pixels",
      "opacity_range": "6 to 14 percent",
      "permitted_colours": [
        "warm ivory at low opacity",
        "brand-sampled green at very low opacity",
        "muted brass for one short accent"
      ],
      "placement": "Keep the most visible lines in the outer left and right thirds. No line may pass through the exact 1600 by 546 logo rectangle.",
      "meaning_rule": "Lines remain abstract and must not imply real fiscal data, a real chart, a map, a currency symbol, an account balance or a numerical measurement."
    },
    "particles": {
      "enabled": false,
      "reason": "Material depth comes from stable paper texture and controlled illumination. Dust, sparks, glitter, digital motes and money-like fragments would undermine the sober public-policy tone."
    }
  },
  "camera_specification": {
    "camera_type": "Locked two-dimensional editorial composition",
    "conceptual_lens_equivalent": "50 millimetres",
    "base_position": "Centred, level and perpendicular to the material plane",
    "rotation_x_degrees": 0,
    "rotation_y_degrees": 0,
    "rotation_z_degrees": 0,
    "camera_shake": 0,
    "handheld_motion": false,
    "rack_focus": false,
    "synthetic_depth_of_field": false,
    "environmental_push": {
      "start_scale_percent": 100.0,
      "end_scale_percent": 100.8,
      "active_frames": "24 through 155",
      "easing": "Cubic Bezier 0.22, 0.61, 0.36, 1.00",
      "application": "Apply only to the clean environmental composite before the exact logo layer is added."
    },
    "logo_camera_independence": "The official logo does not inherit the environmental push. It resolves to and remains at native 1600 by 546 pixels during the hero hold.",
    "parallax_limit": "Outer geometry may drift no more than eight 4K pixels over the complete eight seconds.",
    "forbidden_camera_behaviour": [
      "whip pan",
      "rapid push",
      "orbit",
      "dutch angle",
      "handheld shake",
      "perspective swing",
      "focus pull across the identity",
      "three-dimensional logo extrusion"
    ]
  },
  "lighting_specification": {
    "base_exposure": "Preserve rich near-black outer values without crushing all material information. The darkest visible environmental areas should remain approximately 3 to 5 IRE.",
    "primary_environment_light": {
      "type": "Large diffused editorial source",
      "origin": "Upper left outside the frame",
      "colour_temperature_kelvin": 4300,
      "maximum_change": "No more than eight percent above base exposure",
      "movement": "Travel extremely slowly from upper left toward the central environment between frames 12 and 83, then settle."
    },
    "secondary_ambient_lift": {
      "origin": "Lower right",
      "colour_temperature_kelvin": 5600,
      "maximum_opacity_percent": 4,
      "purpose": "Retain subtle dimensionality in the charcoal environment without introducing blue light."
    },
    "central_field_light": {
      "colour_temperature_kelvin": 4100,
      "quality": "Broad, mineral, matte and edgeless",
      "specular_component": 0,
      "glow_component": "Only the natural tonal falloff defined by the super-Gaussian field; no bloom halo"
    },
    "logo_light_rule": "Do not place a moving gleam, reflection, flare, bevel, emboss, metallic texture or specular sweep over the official logo.",
    "flare_policy": "No lens flare, light leak, anamorphic streak, starburst or artificial sun ray."
  },
  "timeline": [
    {
      "phase": "Absolute Opening",
      "frames": "0-7",
      "time_seconds": "0.000-0.333",
      "visual_state": "Begin on a uniform near-black field. At frame 0 there is no logo, line work or visible focal object.",
      "environment_opacity_percent": {
        "frame_0": 0,
        "frame_7": 100
      },
      "movement": "None. Only the near-black environment settles into visibility.",
      "easing": "Linear opacity across eight frames.",
      "audio_intent": "Begin with nearly inaudible stable room tone around minus 52 decibels full scale. Do not place an impact on frame 0."
    },
    {
      "phase": "Material Awakening",
      "frames": "8-23",
      "time_seconds": "0.333-1.000",
      "visual_state": "Fine charcoal mineral-paper texture and faint warm fibres become perceptible. The upper-left diffused light enters without a visible spotlight boundary.",
      "texture_opacity_percent": {
        "frame_8": 0,
        "frame_15": 45,
        "frame_23": 100
      },
      "primary_light_intensity_percent": {
        "frame_8": 0,
        "frame_23": 35
      },
      "environment_scale_percent": {
        "frame_8": 100.0,
        "frame_23": 100.0
      },
      "easing": "Cubic Bezier 0.45, 0.00, 0.55, 1.00",
      "audio_intent": "Introduce one very soft paper or fabric movement. It should be felt rather than recognised and must not become a directional commercial whoosh."
    },
    {
      "phase": "System Lines Establish",
      "frames": "24-47",
      "time_seconds": "1.000-2.000",
      "visual_state": "Two thin outer ledger lines appear, followed by one short muted-brass hairline. The middle remains calm and empty.",
      "left_line": {
        "placement": "Left outer third",
        "orientation": "Horizontal",
        "draw_direction": "Centre-left toward the left edge",
        "visible_length_percent": {
          "frame_24": 0,
          "frame_39": 100,
          "frame_47": 100
        },
        "maximum_opacity_percent": 11
      },
      "right_line": {
        "placement": "Right outer third",
        "orientation": "Vertical",
        "draw_direction": "Top toward bottom",
        "visible_length_percent": {
          "frame_30": 0,
          "frame_47": 100
        },
        "maximum_opacity_percent": 8
      },
      "brass_hairline": {
        "start_frame": 36,
        "end_frame": 47,
        "maximum_length_normalised": 0.09,
        "maximum_opacity_percent": 18
      },
      "environment_scale_percent": {
        "frame_24": 100.0,
        "frame_47": 100.15
      },
      "easing": "Quintic ease out with no overshoot.",
      "audio_intent": "Add a low, warm tonal onset around frame 32. Avoid percussion, metallic clicks and digital interface sounds."
    },
    {
      "phase": "Edgeless Warm-Mineral Illumination",
      "frames": "48-71",
      "time_seconds": "2.000-3.000",
      "visual_state": "A broad warm-mineral field develops from within the centre of the same charcoal material. It brightens the future logo region while retaining continuous soft falloff to the frame edges.",
      "central_field_intensity_percent": {
        "frame_48": 0,
        "frame_55": 18,
        "frame_63": 62,
        "frame_71": 100
      },
      "central_field_centre_pixels": {
        "x": 1920,
        "y": 1080
      },
      "central_field_profile": "Continuous super-Gaussian using the fixed horizontal divisor 1520, vertical divisor 860 and exponent 4.",
      "environment_scale_percent": {
        "frame_48": 100.15,
        "frame_71": 100.36
      },
      "boundary_control": "At no frame may the illumination resemble a rectangle, plaque, card, window, spotlight circle or separately composited object.",
      "texture_integration": "The existing paper texture remains visible at reduced strength through the light field, proving that the frame is one continuous surface.",
      "easing": "Cubic Bezier 0.16, 1.00, 0.30, 1.00",
      "audio_intent": "Introduce a restrained low-frequency harmonic bloom at frame 52 with an attack longer than 180 milliseconds. It must not resemble a trailer boom."
    },
    {
      "phase": "Exact Logo Reveal",
      "frames": "72-107",
      "time_seconds": "3.000-4.500",
      "visual_state": "Reveal the approved 1600 by 546 RGBA logo asset directly over the completed warm-mineral field. The identity remains one protected layer.",
      "logo_dimensions_pixels": {
        "width": 1600,
        "height": 546
      },
      "logo_x_pixels": 1120,
      "logo_y_pixels": {
        "frame_72": 817,
        "frame_79": 815,
        "frame_87": 812,
        "frame_95": 809,
        "frame_103": 808,
        "frame_107": 807
      },
      "logo_opacity_percent": {
        "frame_72": 0,
        "frame_79": 12,
        "frame_87": 42,
        "frame_95": 78,
        "frame_103": 97,
        "frame_107": 100
      },
      "logo_scale_x_percent": 100,
      "logo_scale_y_percent": 100,
      "logo_rotation_degrees": 0,
      "reveal_matte": {
        "direction": "Left to right",
        "feather_pixels_at_4k": 28,
        "start_x_pixels": 960,
        "end_x_pixels": 2880,
        "leading_edge": "Neutral and soft with no glow or colour fringe",
        "source_rule": "The matte reveals approved extracted pixels only and never generates or paints a logo element."
      },
      "logo_blur_pixels": 0,
      "logo_glow_percent": 0,
      "easing": "Cubic Bezier 0.22, 0.61, 0.36, 1.00",
      "audio_intent": "Introduce one soft rounded harmonic tone at frame 78. A second quieter supporting tone may enter at frame 96. Avoid a triumphant brand sting."
    },
    {
      "phase": "Master Still Resolution",
      "frames": "108-131",
      "time_seconds": "4.500-5.500",
      "visual_state": "Frame 108 is the exact resolved master composition. The logo is crisp, native-sized, centred and unobstructed over the continuous warm-mineral field.",
      "logo_top_left_pixels": {
        "x": 1120,
        "y": 807
      },
      "logo_dimensions_pixels": {
        "width": 1600,
        "height": 546
      },
      "logo_opacity_percent": 100,
      "logo_position_change": "Zero pixels throughout this phase.",
      "logo_scale_change": "Zero percent throughout this phase.",
      "background_motion": "The upper-left light completes its movement by frame 116. Outer geometry may drift by no more than two additional pixels before stopping at frame 124.",
      "reading_priority": "No animated line, texture pulse or concentrated highlight may cross behind the green symbol, grey organisation name, tagline or periods.",
      "audio_intent": "Allow the harmonic material to decay naturally. No new sound event should compete with reading the identity."
    },
    {
      "phase": "Institutional Hold",
      "frames": "132-155",
      "time_seconds": "5.500-6.500",
      "visual_state": "Hold the complete identity without visible movement. The surrounding environment may breathe only through nearly imperceptible illumination change.",
      "logo_top_left_pixels": {
        "x": 1120,
        "y": 807
      },
      "logo_dimensions_pixels": {
        "width": 1600,
        "height": 546
      },
      "logo_opacity_percent": 100,
      "central_field_intensity_change": "Decrease by no more than two percent between frames 132 and 155.",
      "green_outer_rule_change": "Increase from nine percent opacity to twelve percent opacity over the phase.",
      "environment_scale_percent": {
        "frame_132": 100.72,
        "frame_155": 100.8
      },
      "motion_visibility_rule": "A normal-speed viewer may sense polish but should not be able to identify an obvious moving effect.",
      "audio_intent": "Maintain a low warm bed around minus 30 decibels full scale, leaving ample room for the upcoming dialogue."
    },
    {
      "phase": "Documentary Handoff",
      "frames": "156-191",
      "time_seconds": "6.500-8.000",
      "visual_state": "Transition from the resolved identity into the documentary's first substantive quotation. The Minister's voice may begin as a J-cut while the logo remains visible.",
      "voice_j_cut": {
        "preferred_start_frame": 163,
        "preferred_start_time_seconds": 6.792,
        "instruction": "Begin with a meaningful statement rather than a greeting, presenter introduction or production credit.",
        "priority": "Dialogue becomes the dominant audio element immediately."
      },
      "logo_top_left_pixels": {
        "x": 1120,
        "y": 807
      },
      "logo_dimensions_pixels": {
        "width": 1600,
        "height": 546
      },
      "logo_opacity_percent": {
        "frame_156": 100,
        "frame_167": 100,
        "frame_179": 48,
        "frame_191": 0
      },
      "central_field_intensity_percent_relative_to_hero": {
        "frame_156": 98,
        "frame_167": 96,
        "frame_179": 55,
        "frame_191": 8
      },
      "ledger_geometry_opacity_percent_relative_to_phase_peak": {
        "frame_156": 100,
        "frame_171": 70,
        "frame_191": 0
      },
      "transition_method": "Use a clean luminance-controlled dissolve during the final twelve frames. If the selected destination is itself very dark, the dissolve may begin six frames earlier for an eighteen-frame blend.",
      "destination_preference": "An authentic corridor photograph, an authentic document detail or a restrained near-black frame with corrected subtitles supporting the first quotation.",
      "forbidden_exit_methods": [
        "zoom tunnel",
        "page turn",
        "glitch",
        "white flash",
        "ink splash",
        "shattering logo",
        "rotating logo",
        "rapid blur",
        "digital scan"
      ],
      "audio_intent": "Reduce the musical material by at least six decibels between frames 163 and 191. Keep dialogue dry, clear and centred, with a subtle room-tone bridge."
    }
  ],
  "easing_library": {
    "slow_editorial_reveal": "Cubic Bezier 0.16, 1.00, 0.30, 1.00",
    "controlled_settle": "Cubic Bezier 0.22, 0.61, 0.36, 1.00",
    "symmetric_light_change": "Cubic Bezier 0.45, 0.00, 0.55, 1.00",
    "strict_prohibitions": [
      "No bounce",
      "No spring",
      "No elastic response",
      "No overshoot",
      "No anticipation recoil",
      "No speed ramp",
      "No sudden stop",
      "No motion blur used to conceal damaged identity pixels"
    ]
  },
  "audio_direction": {
    "overall_character": "Quiet, warm, tactile and serious. The sound should suggest the opening of an important public conversation rather than a commercial product launch.",
    "sample_rate_hz": 48000,
    "bit_depth": 24,
    "integrated_loudness_target_lufs": -20,
    "maximum_true_peak_dbtp": -3,
    "elements": [
      {
        "element": "Room tone",
        "description": "Nearly inaudible stable ambience beginning at frame 0.",
        "level_guidance": "Approximately minus 52 to minus 46 decibels full scale."
      },
      {
        "element": "Paper movement",
        "description": "One soft organic movement between frames 10 and 24.",
        "level_guidance": "Remain below minus 34 decibels full scale."
      },
      {
        "element": "Tonal foundation",
        "description": "A low warm tone beginning near frame 32 without an identifiable melody.",
        "level_guidance": "Remain below minus 28 decibels full scale during the identity reveal."
      },
      {
        "element": "Identity bloom",
        "description": "Two restrained harmonic notes during frames 78 through 107.",
        "level_guidance": "Soft attack, long decay and no high-frequency sparkle."
      },
      {
        "element": "Dialogue J-cut",
        "description": "The first documentary quotation begins before the identity disappears.",
        "level_guidance": "Dialogue peaks between minus 6 and minus 3 decibels full scale and remains clearly dominant."
      }
    ],
    "prohibited_sounds": [
      "cash-register sound",
      "coin drop",
      "money counting",
      "camera shutter",
      "keyboard typing",
      "digital scanner",
      "futuristic interface beep",
      "aggressive whoosh",
      "cinematic impact boom",
      "trailer riser",
      "snare hit",
      "corporate ukulele",
      "crowd applause",
      "national anthem fragment"
    ]
  },
  "logo_invariants": {
    "non_negotiable_rule": "The official identity is evidence, not generative decoration. Every visible identity pixel must originate from the supplied 1600 by 546 source through the approved deterministic alpha extraction.",
    "locked_properties": [
      "JRB symbol shapes",
      "J curve",
      "R junction",
      "B counters",
      "Organisation-name spelling",
      "Organisation-name spacing",
      "Tagline spelling",
      "Tagline periods",
      "Relative position of symbol and words",
      "Relative position of tagline",
      "Original green and grey colours",
      "Exact 800:273 aspect ratio",
      "Source antialiasing",
      "Native 1600 by 546 hero dimensions"
    ],
    "permitted_transformations": [
      "Two-dimensional whole-layer translation during entrance",
      "Whole-layer opacity",
      "External alpha-matte reveal",
      "Clean whole-layer dissolve"
    ],
    "forbidden_transformations": [
      "Perspective warp",
      "Corner pin",
      "Non-uniform scale",
      "Horizontal stretch",
      "Vertical stretch",
      "Rotation",
      "Three-dimensional extrusion",
      "Bevel",
      "Emboss",
      "Glow",
      "Added stroke",
      "Per-letter animation",
      "Per-word animation",
      "Colour cycling",
      "Texture replacement",
      "AI reconstruction",
      "AI upscaling that hallucinates edges",
      "Frame interpolation across the identity"
    ]
  },
  "generative_model_negative_prompt": [
    "Do not generate, redraw, imitate or reinterpret the JRB logo.",
    "Do not generate letters, words, captions, slogans, numbers or pseudo-writing.",
    "Do not invent a different green monogram.",
    "Do not create a visible backing rectangle, logo card, plaque, floating sheet, screen or central window.",
    "Do not create a hard boundary around the warm central illumination.",
    "Do not introduce flags, coats of arms, seals, government emblems or national symbols.",
    "Do not show people, faces, hands, offices, buildings, roads, maps, charts or currency.",
    "Do not show banknotes, coins, cash particles, gold particles or floating dust.",
    "Do not use neon green, electric blue, purple, magenta or saturated orange.",
    "Do not create glassmorphism, holograms, glowing grids, digital tunnels or interface graphics.",
    "Do not create glitch, chromatic aberration, scan lines, VHS distortion or signal interference.",
    "Do not create lens flares, light leaks, starbursts, volumetric rays or flashing highlights.",
    "Do not create liquid splashes, smoke, fire, sparks, confetti or ink explosions.",
    "Do not create camera shake, whip pans, rapid zooms, rotation or dramatic parallax.",
    "Do not place high-frequency motion inside the exact logo region from x 1120 to 2719 and y 807 to 1352.",
    "Do not insert watermarks, stock-library markings or model signatures."
  ],
  "transition_variants": {
    "preferred_documentary_version": {
      "name": "Voice-Led Environmental Dissolve",
      "description": "The Minister's opening quotation begins at frame 163. The exact logo remains fully visible through frame 167 and then dissolves while the continuous mineral environment darkens or blends into the first authentic documentary image.",
      "use_case": "Main long-form documentary and polished YouTube version."
    },
    "clean_standalone_version": {
      "name": "Near-Black Completion",
      "description": "If the next documentary shot has not been selected, dissolve the logo and central warm field back into the original near-black environment by frame 191 while maintaining the final quarter-second of room tone.",
      "use_case": "Reusable identity bumper supplied as a separate asset."
    },
    "shared_frames": "Both versions must remain identical from frame 0 through frame 167. Only the final transition treatment may differ."
  },
  "export_specification": {
    "master_file": {
      "filename": "JRB_Documentary_Logo_Open_8s_4K_Master_v02.mov",
      "codec": "Apple ProRes 422 HQ",
      "resolution": "3840x2160",
      "frame_rate": "24.000 progressive",
      "colour": "Rec.709 Gamma 2.4, 10-bit",
      "audio": "48 kHz, 24-bit PCM stereo"
    },
    "preview_file": {
      "filename": "JRB_Documentary_Logo_Open_8s_1080p_Review_v02.mp4",
      "codec": "H.264 High Profile",
      "resolution": "1920x1080",
      "frame_rate": "24.000 progressive",
      "video_bitrate": "20 to 30 megabits per second variable bitrate",
      "audio": "AAC 320 kilobits per second at 48 kHz"
    },
    "clean_environment_file": {
      "filename": "JRB_Documentary_Logo_Open_8s_Clean_Environment_v02.mov",
      "content": "Continuous charcoal-to-warm-mineral environment and restrained line animation without the official logo.",
      "codec": "Apple ProRes 422 HQ"
    },
    "logo_overlay_file": {
      "filename": "JRB_Documentary_Logo_Open_8s_Exact_Logo_Overlay_v02.mov",
      "content": "Animation of the approved 1600 by 546 extracted logo over transparency.",
      "codec": "Apple ProRes 4444",
      "alpha": "Straight alpha preferred, with interpretation documented."
    },
    "extracted_logo_asset": {
      "filename": "JRB_Official_Logo_1600x546_RGBA_Approved.png",
      "content": "Single approved deterministic extraction shared by static and animated versions.",
      "checksum_requirement": "Record a SHA-256 checksum in the delivery notes."
    },
    "audio_stem_file": {
      "filename": "JRB_Documentary_Logo_Open_8s_Audio_v02.wav",
      "format": "48 kHz, 24-bit stereo WAV"
    },
    "no_export_modifications": [
      "No automatic frame-rate conversion",
      "No platform stabilisation",
      "No optical flow",
      "No automatic colour enhancement",
      "No automatic HDR conversion",
      "No artificial sharpening",
      "No beauty filter",
      "No social-media watermark"
    ]
  },
  "quality_control_checklist": {
    "frame_accuracy": [
      "Confirm the export contains exactly 192 frames.",
      "Confirm the first frame is 0 and the last visible frame is 191.",
      "Confirm there are no duplicated or missing frames.",
      "Confirm the file reports constant 24.000 progressive frames per second."
    ],
    "alpha_extraction_accuracy": [
      "Confirm the static and animation use the identical approved extracted RGBA asset.",
      "Confirm the robust median background was calculated from all four corner samples.",
      "Confirm colour distance at or below 5 becomes alpha zero.",
      "Confirm distances from 5 through 18 use the fixed linear alpha ramp.",
      "Confirm distances above 18 remain fully opaque.",
      "Confirm connected green and grey identity components were protected.",
      "Confirm source antialiasing remains visible and smooth.",
      "Confirm no rectangle, pale residue or dark edge appears over the final environment."
    ],
    "identity_accuracy": [
      "At frame 108, confirm the logo layer is exactly 1600 by 546 pixels.",
      "At frame 108, confirm its top-left corner is exactly x 1120 and y 807.",
      "Confirm its centre is exactly x 1920 and y 1080.",
      "Inspect the J curve at 200 percent for halos or erosion.",
      "Inspect the R junction at 200 percent for missing pixels.",
      "Inspect both B counters at 200 percent for damaged interior edges.",
      "Inspect Joint Revenue Board for malformed letters or altered spacing.",
      "Inspect Harmonise. Optimise. Trust. for exact spelling and all periods.",
      "Confirm the complete identity remains inside title-safe boundaries.",
      "Confirm no environmental line crosses the logo."
    ],
    "environment_accuracy": [
      "Confirm the frame reads as one continuous full-frame material.",
      "Confirm the warm-mineral centre has no visible rectangular, circular or card-like edge.",
      "Confirm no hard shadow surrounds the logo region.",
      "Confirm the texture continues naturally through the centre at reduced strength.",
      "Confirm the outer charcoal areas retain subtle material detail.",
      "Confirm the warm field supports comfortable contrast for the grey tagline."
    ],
    "motion_accuracy": [
      "Confirm the logo remains at 100 percent scale throughout the reveal and hold.",
      "Confirm only its y position and opacity change during entrance.",
      "Confirm the logo is completely stationary from frame 108 through frame 167.",
      "Confirm the identity remains sharp throughout the reveal.",
      "Confirm environmental drift never exceeds the specified pixel limits.",
      "Confirm frames 108 through 155 provide a comfortable reading hold.",
      "Confirm no texture flicker, crawling edge or unstable generative detail appears."
    ],
    "colour_and_luminance": [
      "Verify environmental green was sampled from the official source.",
      "Verify the background preserves near-black texture without elevated grey blacks.",
      "Verify gradients show no visible banding on a calibrated Rec.709 display.",
      "Verify the extracted green and grey source colours have not shifted.",
      "Verify no clipped highlights or illegal broadcast levels are present."
    ],
    "audio_quality": [
      "Confirm no click occurs at frame 0 or frame 191.",
      "Confirm the identity sound remains understated.",
      "Confirm the J-cut dialogue is effortless to understand.",
      "Confirm music drops beneath dialogue.",
      "Confirm true peak does not exceed minus 3 decibels true peak."
    ],
    "final_rejection_conditions": [
      "Reject if any logo element was generated or redrawn by artificial intelligence.",
      "Reject if the name or tagline is misspelled.",
      "Reject if any tagline period is missing.",
      "Reject if the logo is not exactly 1600 by 546 at the hero hold.",
      "Reject if the hero top-left coordinate is not exactly x 1120 and y 807.",
      "Reject if the logo has been stretched, cropped, rotated or recoloured.",
      "Reject if a visible rectangular backing field remains after alpha extraction.",
      "Reject if the central illumination resembles a card, plaque or screen.",
      "Reject if particles, currency, flags, invented seals or fake data appear.",
      "Reject if the animation resembles a television-news ident or generic corporate template.",
      "Reject if the viewer cannot comfortably read the identity.",
      "Reject if frame timing differs from the approved 192-frame structure."
    ]
  },
  "operator_instruction": "First create and approve the deterministic 1600 by 546 RGBA extraction, then use that same checksummed asset for the static master and animation. Build the continuous environment without any identity present. Review the environmental motion and confirm that its warm central field has no visible boundary. Lock the environment layers, import the approved native-sized logo, place it at x 1120 and y 807 for the hero state, apply only the specified whole-layer opacity, vertical translation and external reveal matte, and execute every quality-control check. When a creative preference conflicts with exact identity reproduction, identity accuracy always wins.",
  "word_count_estimate": 4560
}
```
