# JRB Documentary Starting Image Specification

This production specification defines the exact visual construction, immutable-logo handling, export requirements, and quality-control checks for the 3840×2160 JRB documentary opening still.

```json
{
  "specification_metadata": {
    "title": "Joint Revenue Board Premium Documentary Opening Still",
    "specification_version": "1.1",
    "deliverable_type": "Single-frame documentary opening image",
    "target_use": [
      "Opening frame of the long-form ministerial documentary",
      "Source frame for a separately specified motion sequence",
      "Sixteen-by-nine YouTube and institutional presentation master",
      "High-resolution archive master from which smaller delivery versions may be derived"
    ],
    "creative_standard": "Premium public-institution documentary with the restraint of an international current-affairs film, not an advertisement, corporate slide, social-media flyer, logo card, television ident, or generic government event banner",
    "word_count_estimate": 3919
  },
  "source_asset": {
    "file_path": "/Users/ram/Documents/Codex/2026-07-23/referenced-chatgpt-conversation-this-is-untrusted/work/source/jrb_logo.png",
    "asset_description": "Official Joint Revenue Board horizontal lockup containing the green JRB monogram, grey Joint Revenue Board wordmark, and grey italic tagline Harmonise. Optimise. Trust.",
    "source_dimensions_observed": {
      "width_pixels": 1600,
      "height_pixels": 546,
      "aspect_ratio": "800:273",
      "decimal_aspect_ratio": 2.930403
    },
    "asset_role": "Immutable official foreground artwork composited at its native pixel dimensions after the background has been generated or constructed",
    "absolute_rules": [
      "Do not ask an image-generation model to recreate, trace, interpret, redraw, restyle, typeset, or approximate any part of the logo.",
      "Do not change the spelling, punctuation, capitalization, ordering, spacing, typeface, italic treatment, glyph construction, monogram geometry, colour relationships, or visual proportions contained in the supplied source asset.",
      "Do not crop the J, R, B, organisation name, or tagline.",
      "Do not convert the logo into gold, white, black, monochrome, embossed, metallic, neon, glass, three-dimensional, outlined, bevelled, extruded, or textured artwork.",
      "Do not generate a substitute logo when the source file is unavailable. Stop production and report the missing asset instead.",
      "Do not apply a drop shadow, outer glow, stroke, rim, chromatic offset, motion blur, perspective transform, skew, rotation, warp, liquify effect, displacement map, or simulated depth to the official artwork.",
      "Do not place the logo inside a rectangle, floating card, rounded box, plaque, glass panel, framed container, or obvious light-coloured patch.",
      "The logo must remain the sharpest and most legible element in the final composition.",
      "The logo must be placed at its native dimensions of 1600 by 546 pixels. No enlargement or reduction is permitted in the 3840 by 2160 master."
    ],
    "permitted_operations": [
      "Exact native-size placement without raster resampling",
      "Sub-pixel placement only if required by the finishing application, although integer placement is strongly preferred",
      "Creation of an alpha channel that removes only the source image background while preserving every coloured and grey foreground pixel",
      "Colour-managed conversion into the final working colour space without visually changing the official colours",
      "A minor whole-layer optical position adjustment within the explicitly defined limits"
    ],
    "background_isolation_method": {
      "method": "Deterministic background-colour alpha extraction performed outside the generative model",
      "sampling": "Sample the source background from all four corners and from four additional edge locations containing no official artwork. Calculate a robust median RGB value and use that sampled value as the removal reference instead of assuming pure white.",
      "mask_logic": "Pixels within a colour-distance threshold of 5 on a zero-to-255 RGB scale become fully transparent. Pixels between distances 5 and 18 receive a smooth linear alpha transition. Pixels farther than 18 remain fully opaque.",
      "edge_protection": "Protect pixels connected to the green monogram or grey lettering from background removal. Preserve original antialiased boundary colours and do not replace them with newly synthesized edge pixels.",
      "component_protection": [
        "Protect the complete descending curve of the J.",
        "Protect the internal negative spaces and junctions of the R and B.",
        "Protect every grey letter in Joint Revenue Board.",
        "Protect the complete italic tagline and all three full stops.",
        "Protect low-opacity antialiasing pixels at the top, bottom, left, and right extremities of the official artwork."
      ],
      "manual_qc": "Inspect the J curve, internal R junction, B counters, the smallest tagline letterforms, full stops after each tagline word, and all wordmark edges at 200 percent and 400 percent magnification. There must be no white halo, dark fringe, clipped punctuation, pinholes, or semitransparent erosion.",
      "fallback": "If clean background isolation cannot be achieved without altering the official artwork, place the unmodified source against a mathematically matched full-frame background colour sampled from the asset. The colour match must cover the entire 3840 by 2160 canvas so that no rectangle, card, patch, boundary, or tonal seam is visible."
    }
  },
  "canvas": {
    "master_width_pixels": 3840,
    "master_height_pixels": 2160,
    "aspect_ratio": "16:9",
    "orientation": "Landscape",
    "pixel_aspect_ratio": "1:1 square pixels",
    "working_colour_space": "Display P3 or Adobe RGB for construction, converted to Rec.709 gamma 2.4 for video delivery",
    "bit_depth": "16 bits per channel during construction, 8 or 16 bits per channel for final PNG according to the finishing application",
    "coordinate_origin": "Top-left corner at x 0, y 0",
    "centre_point": {
      "x": 1920,
      "y": 1080
    },
    "safe_areas": {
      "action_safe_rectangle": {
        "x": 192,
        "y": 108,
        "width": 3456,
        "height": 1944
      },
      "logo_safe_rectangle": {
        "x": 960,
        "y": 647,
        "width": 1920,
        "height": 866
      },
      "compression_safe_margin_pixels": 96,
      "rule": "No important logo pixels, fine lines, highlight edges, or contrast boundaries may fall outside the logo-safe rectangle."
    }
  },
  "core_visual_concept": {
    "concept_name": "An Institution Built on Connected Lines",
    "one_sentence_direction": "The official JRB lockup sits directly within a quiet, full-frame architectural field of warm mineral paper, deep institutional green light, and extremely restrained ledger-like geometry, giving the impression of a serious public institution emerging from order, coordination, and trust.",
    "emotional_register": [
      "Credible",
      "Measured",
      "Confident",
      "Contemporary",
      "Public-serving",
      "Intellectually serious",
      "Calm rather than celebratory"
    ],
    "narrative_function": "The still should create a two-to-four-second pause of authority before the first spoken documentary quotation. It must establish ownership and institutional seriousness without delaying the audience through an elaborate logo spectacle.",
    "prohibited_readings": [
      "PowerPoint cover slide",
      "Logo pasted onto a stock texture",
      "Bank advertisement",
      "Fintech product launch",
      "Political campaign graphic",
      "Government conference flyer",
      "Television-news breaking-news card",
      "Luxury-brand perfume advert",
      "Technology startup ident"
    ]
  },
  "composition": {
    "overall_structure": "A single uninterrupted environment fills all 3840 by 2160 pixels. There is no separate central card. A broad, softly illuminated mineral-paper plane occupies the middle of the image and transitions continuously into deeper green-charcoal edge fields. The official logo is placed directly into this continuous environment at its native 1600 by 546 pixel dimensions.",
    "primary_logo_box": {
      "x": 1120,
      "y": 807,
      "width": 1600,
      "height": 546,
      "right_edge_x": 2720,
      "bottom_edge_y": 1353,
      "centre_x": 1920,
      "centre_y": 1080,
      "scale_relative_to_source": 1,
      "horizontal_canvas_coverage_percent": 41.6667,
      "vertical_canvas_coverage_percent": 25.2778,
      "alignment": "Geometrically centred on the canvas at x 1920 and y 1080",
      "rotation_degrees": 0,
      "skew_degrees": 0,
      "perspective_distortion": 0,
      "opacity_percent": 100,
      "blend_mode": "Normal",
      "resampling": "None because the source remains at its native dimensions"
    },
    "logo_optical_adjustment": {
      "instruction": "The default and preferred placement is exactly x 1120 and y 807. Because the large green monogram may carry more optical weight than the grey wordmark, a final whole-layer optical nudge is allowed only after full-frame review. The nudge must not change scale, aspect ratio, rotation, opacity, or internal spacing.",
      "maximum_adjustment_pixels": {
        "horizontal_left": 8,
        "horizontal_right": 8,
        "vertical_up": 4,
        "vertical_down": 4
      },
      "permitted_final_top_left_bounds": {
        "minimum_x": 1112,
        "maximum_x": 1128,
        "minimum_y": 803,
        "maximum_y": 811
      },
      "restriction": "The final logo must always remain exactly 1600 by 546 pixels with an aspect ratio of 800:273."
    },
    "visual_weight_distribution": {
      "centre_42_percent": "Quietest and brightest region, reserved for absolute logo clarity and uninterrupted negative space",
      "left_29_percent": "Slightly deeper green shadow and subtle architectural line convergence that visually supports the monogram without touching it",
      "right_29_percent": "Warm grey-to-green tonal falloff that supports the lighter wordmark without lowering contrast",
      "top_24_percent": "Sparse negative space with almost no line detail",
      "bottom_24_percent": "Slightly more tactile paper fibre and a restrained low-frequency shadow, never a platform or horizon"
    },
    "depth_language": "Depth is communicated only through gradual illumination, natural material variation, and extremely soft occlusion. There are no floating planes, literal walls, desks, stages, shelves, frames, podiums, or three-dimensional logo objects."
  },
  "background_geometry": {
    "base_field": {
      "coverage": {
        "x": 0,
        "y": 0,
        "width": 3840,
        "height": 2160
      },
      "description": "Full-frame seamless warm limestone-paper surface with very fine tooth, controlled tonal variation, and no visible seam, panel edge, rectangle, or repeated tile.",
      "centre_colour": "#E7E2D7",
      "edge_colour": "#9DA59C",
      "corner_shadow_colour": "#07130F"
    },
    "central_light_region": {
      "shape": "Large feathered elliptical field, never a visible panel",
      "centre_x": 1920,
      "centre_y": 1060,
      "radius_x": 1420,
      "radius_y": 690,
      "inner_colour": "#F0ECE2",
      "edge_colour": "#D7D4CA",
      "feather_pixels": 560,
      "maximum_luminance_percent": 88,
      "instruction": "The ellipse must be visually undetectable as a discrete shape. It exists only as a gradual natural illumination zone beneath and around the native-size logo. There may be no straight light boundary within 500 pixels of the logo."
    },
    "left_green_field": {
      "anchor_rectangle": {
        "x": 0,
        "y": 0,
        "width": 1080,
        "height": 2160
      },
      "gradient_start": "#07130F",
      "gradient_end": "transparent",
      "gradient_angle_degrees": 12,
      "effective_opacity_percent": 78,
      "transition_end_x": 1360,
      "instruction": "The dark green should frame, not swallow, the green monogram. Maintain a continuous light neutral transition before the field reaches the logo exclusion zone."
    },
    "right_shadow_field": {
      "anchor_rectangle": {
        "x": 2980,
        "y": 0,
        "width": 860,
        "height": 2160
      },
      "gradient_start": "transparent",
      "gradient_end": "#10261D",
      "effective_opacity_percent": 46,
      "transition_start_x": 2760,
      "instruction": "The shadow remains outside the logo exclusion zone and preserves a minimum local contrast ratio of 4.5 to 1 for the grey organisation name and tagline."
    },
    "ledger_line_system": {
      "purpose": "Suggest coordination, structure, and harmonisation without becoming a chart, spreadsheet, network diagram, or data visualization.",
      "line_colour": "#1C5D3A",
      "secondary_line_colour": "#A28A5D",
      "line_opacity_range_percent": "4 to 11",
      "line_width_range_pixels": "1 to 2.5 at 3840-pixel width",
      "blur_radius_pixels": "0 to 0.6",
      "primary_paths": [
        {
          "path_description": "A shallow rising line beginning off-canvas at x -120, y 1740, passing through x 430, y 1575, and fading completely by x 960, y 1465",
          "visibility_rule": "The line terminates before the left boundary of the logo exclusion zone and cannot pass beneath the official artwork."
        },
        {
          "path_description": "A long horizontal hairline beginning at x 2860, y 486 and ending off-canvas at x 3970, y 486",
          "visibility_rule": "Opacity peaks at 8 percent near x 3370 and fades to zero at both ends."
        },
        {
          "path_description": "Three parallel vertical traces at x 3370, 3412, and 3466, extending from y 1510 to y 2180",
          "visibility_rule": "Each line uses a different opacity between 4 and 7 percent and remains subordinate to the material texture."
        }
      ],
      "node_policy": "No dots, circles, arrows, labels, axes, numerical ticks, or connectors that could imply real statistics.",
      "logo_exclusion_zone": {
        "x": 1020,
        "y": 707,
        "width": 1800,
        "height": 746,
        "right_edge_x": 2820,
        "bottom_edge_y": 1453,
        "instruction": "No visible ledger line, brass rule, dark-green boundary, texture discontinuity, or decorative geometry may enter this exclusion zone unless its final opacity is below 2 percent and it remains completely imperceptible beneath the logo."
      }
    },
    "brass_accent": {
      "element": "One restrained hairline integrated into the lower-right environment",
      "start_point": {
        "x": 2860,
        "y": 1788
      },
      "end_point": {
        "x": 3380,
        "y": 1788
      },
      "width_pixels": 2,
      "colour": "#9B8151",
      "opacity_percent": 24,
      "end_fade_pixels": 90,
      "restriction": "It must never resemble an underline for the logo, wordmark, or tagline."
    }
  },
  "palette": {
    "background_only_rule": "These colours govern the environment only. The supplied logo retains its exact embedded colours and must not be recoloured to match this palette.",
    "colours": [
      {
        "name": "Near-black institutional green",
        "hex": "#07130F",
        "usage_percent": 17
      },
      {
        "name": "Deep bottle green",
        "hex": "#103424",
        "usage_percent": 13
      },
      {
        "name": "Warm mineral ivory",
        "hex": "#E7E2D7",
        "usage_percent": 46
      },
      {
        "name": "Soft limestone grey",
        "hex": "#BFC1B8",
        "usage_percent": 18
      },
      {
        "name": "Muted archival brass",
        "hex": "#9B8151",
        "usage_percent": 2
      },
      {
        "name": "Natural tonal variation",
        "hex": "Derived continuously between the listed values",
        "usage_percent": 4
      }
    ],
    "saturation_policy": "Background saturation must remain below 28 percent everywhere except in tiny line accents. No emerald neon, cyan, bright lime, electric blue, orange, or magenta is permitted.",
    "black_policy": "Avoid absolute digital black except outside the deliverable during compositing. The darkest visible pixel should retain slight green information.",
    "white_policy": "Avoid pure white in the environment. The brightest background pixel should not exceed RGB 244, 242, 235 before Rec.709 conversion.",
    "logo_colour_policy": "Never sample, harmonize, remap, tint, grade, or normalize the official green and grey logo colours. Background corrections must be made beneath the logo instead."
  },
  "material_and_texture": {
    "primary_material": {
      "description": "A seamless hybrid of fine archival paper and honed limestone, tactile enough to feel photographed but abstract enough to remain timeless",
      "fibre_scale_pixels": "2 to 9",
      "pore_scale_pixels": "1 to 4",
      "contrast_percent": "2 to 4",
      "directionality": "Predominantly horizontal with mild natural irregularity"
    },
    "secondary_material": {
      "description": "Very faint vertical brushed-mineral variation in the dark green edge fields",
      "opacity_percent": 6,
      "frequency": "Low",
      "restriction": "No wood grain, fabric weave, concrete cracks, scratches, dirt, fingerprints, stains, folds, torn paper, distressed antique treatment, or visible surface damage"
    },
    "film_grain": {
      "type": "Fine monochromatic Gaussian grain",
      "amount_percent": 1.4,
      "size_pixels": 0.9,
      "distribution": "Uniform across the background only",
      "logo_protection": "Mask the complete 1600 by 546 logo layer from artificial grain so the official artwork stays clean"
    },
    "vignette": {
      "shape": "Large elliptical",
      "centre_x": 1920,
      "centre_y": 1050,
      "maximum_corner_reduction_stops": 0.32,
      "feather_pixels": 720,
      "colour_bias": "Slight green rather than neutral black",
      "restriction": "The vignette must not look like a preset and must not reduce logo readability."
    }
  },
  "lighting": {
    "lighting_philosophy": "Light should feel physically plausible, broad, and editorial. It should sculpt the continuous background without creating a theatrical spotlight, rectangular reveal, or luminous card around the logo.",
    "key_light": {
      "virtual_position": {
        "x": 1180,
        "y": -360,
        "z": 950
      },
      "source_type": "Very large diffused rectangular source",
      "virtual_size": {
        "width": 2100,
        "height": 1050
      },
      "colour_temperature_kelvin": 4700,
      "intensity_relative_units": 1,
      "falloff": "Inverse-square softened by the broad source",
      "effect": "Produces a calm warm highlight across the upper-middle paper field without a visible hotspot or hard boundary"
    },
    "fill_light": {
      "virtual_position": {
        "x": 3260,
        "y": 920,
        "z": 620
      },
      "source_type": "Soft indirect bounce",
      "colour_temperature_kelvin": 5600,
      "intensity_relative_units": 0.24,
      "effect": "Prevents the right side from becoming muddy behind the grey organisation name"
    },
    "lower_negative_fill": {
      "region": {
        "x": 0,
        "y": 1650,
        "width": 3840,
        "height": 510
      },
      "strength_stops": -0.18,
      "effect": "Adds subtle gravitas to the bottom edge while leaving the tagline fully legible"
    },
    "highlight_control": {
      "maximum_background_value_ire": 92,
      "minimum_background_value_ire": 4,
      "rolloff": "Smooth and filmic, with no clipped highlight areas",
      "logo_rule": "Lighting effects belong entirely below the composited logo. Never paint highlights, shadows, bloom, haze, or reflected colour across the official asset."
    }
  },
  "generation_prompt": {
    "usage_rule": "Generate or construct the background only. Do not provide the official logo to the background-generation stage, and do not request any text.",
    "positive_prompt": "Create a full-bleed 16:9 premium institutional documentary background at exactly 3840 by 2160 pixels. The entire frame is one uninterrupted, seamless environment combining fine archival paper and honed limestone. A very broad, naturally illuminated warm-mineral ivory field occupies the centre, transitioning gradually and organically into deep near-black institutional green at the far left and restrained bottle-green shadow at the far right. The centre must remain calm, clean, and spacious for a separately composited official logo measuring 1600 by 546 pixels and centred on the frame. Do not create a blank rectangle or panel for that logo; create one continuous material and one continuous light environment. Introduce exceptionally subtle ledger-inspired hairline geometry only near the outer edges: one shallow rising line low on the left, one long faded horizontal trace high on the right, and three nearly invisible vertical traces in the lower-right corner. Include one muted archival-brass hairline near the lower-right edge. Use broad museum-quality diffused illumination from the upper-left, a faint cool-neutral bounce from the right, soft natural tonal falloff, microscopic paper fibres, very fine mineral pores, and restrained monochromatic grain. The result should feel like the opening of a serious international public-affairs documentary about institutions, trust, reform, and coordinated revenue administration. Maintain elegant negative space and a quiet visual hierarchy. Photoreal material behaviour, restrained colour, subtle tactile depth, sober authority, no literal office and no recognisable place.",
    "negative_prompt": "No letters, words, typography, monograms, logos, seals, flags, maps, coats of arms, government emblems, people, faces, hands, buildings, currency, coins, banknotes, charts, numbers, percentages, graphs, arrows, spreadsheet cells, calculators, documents, signatures, pens, laptops, desks, glass cards, floating rectangles, rounded panels, presentation slides, poster layouts, event flyers, social-media templates, logo placeholder, bright central box, rectangular spotlight, dramatic spotlight, stage, horizon line, neon green, cyan, bright gold, metallic logo, three-dimensional lettering, bevels, embossing, lens flare, bokeh, light streaks, particles, smoke, fog, liquid splashes, glitch, chromatic aberration, scan lines, film scratches, torn paper, dirty concrete, marble veins, fabric folds, fingerprints, visible seams, repeated texture tiles, excessive grain, crushed blacks, clipped whites, oversharpening, shallow depth of field, or an obvious empty card intended for a logo.",
    "background_selection_criteria": [
      "The centre reads as a continuous part of the full frame, not a blank rectangular insertion area.",
      "The left and right shadows feel like illumination and material depth rather than coloured gradient overlays.",
      "The texture remains visible only when inspected closely and does not compete with the native-size logo at normal viewing distance.",
      "The image contains no accidental glyph-like marks, pseudo-writing, fake data, or shapes that resemble official insignia.",
      "The result remains sophisticated when viewed without the logo and becomes complete, rather than busier, after the logo is composited.",
      "The 1800 by 746 pixel logo exclusion zone remains visually calm without looking artificially erased."
    ]
  },
  "compositing_workflow": {
    "sequence": [
      {
        "step": 1,
        "instruction": "Open the selected background in a colour-managed 3840 by 2160 document. Confirm that no scaling distortion, crop mismatch, generated text, or card-like centre area is present."
      },
      {
        "step": 2,
        "instruction": "Import the supplied 1600 by 546 JRB logo without resampling. Confirm the imported layer reports exactly 1600 pixels wide and 546 pixels high. Retain an untouched hidden copy of the original source layer for verification."
      },
      {
        "step": 3,
        "instruction": "Perform the deterministic alpha extraction on a duplicate of the source logo. Do not scale, rotate, skew, sharpen, blur, or apply generative processing."
      },
      {
        "step": 4,
        "instruction": "Place the isolated native-size logo at exactly x 1120 and y 807. Its right edge must be x 2720, its bottom edge must be y 1353, and its centre must be x 1920 and y 1080. Set rotation to zero, opacity to 100 percent, fill to 100 percent, and blend mode to Normal."
      },
      {
        "step": 5,
        "instruction": "Inspect local contrast around the grey wordmark and tagline. If the background reduces legibility, adjust only the background illumination using a very broad feathered curve beneath the logo. Do not alter the logo layer and do not create a visible rectangle."
      },
      {
        "step": 6,
        "instruction": "Review the frame at fit-to-screen, 100 percent, 200 percent, and 400 percent magnification. Do not apply sharpening because the logo is already at native dimensions. If a finishing application automatically resamples the layer, disable that behaviour and repeat the placement."
      },
      {
        "step": 7,
        "instruction": "If an optical position correction is genuinely necessary, move the complete logo layer no more than 8 pixels horizontally and no more than 4 pixels vertically. Record the final x and y values. Do not alter its 1600 by 546 dimensions."
      },
      {
        "step": 8,
        "instruction": "Convert a duplicate master to Rec.709 gamma 2.4, inspect for gamut clipping, and compare the logo against the untouched source under the same colour profile."
      },
      {
        "step": 9,
        "instruction": "Flatten only the delivery copy. Preserve the layered sixteen-bit construction master with the original logo, isolated logo, background, light-control, grain, and colour-management layers separated."
      }
    ],
    "forbidden_post_processing": [
      "No global filter after the logo has been composited if that filter changes the logo colour, contrast, texture, or edge quality.",
      "No generative fill or generative expansion after the official logo layer is present.",
      "No AI enhancement, AI upscale, smart relighting, style transfer, film emulation, halation, or bloom across the flattened frame.",
      "No additional title, subtitle, date, guest name, episode name, ministry name, slogan, or call to action on this opening still.",
      "No resizing of the logo away from its native 1600 by 546 pixel dimensions."
    ]
  },
  "export_specifications": {
    "archive_master": {
      "format": "TIFF or PSD",
      "dimensions": "3840x2160",
      "bit_depth": "16 bits per channel",
      "colour_profile": "Embedded working profile",
      "layers": "Preserved",
      "compression": "Lossless"
    },
    "video_still_master": {
      "format": "PNG",
      "dimensions": "3840x2160",
      "bit_depth": "16 bits per channel where supported",
      "colour_profile": "Embedded Rec.709-compatible profile",
      "alpha": "None in the final full-frame still",
      "interlace": "None"
    },
    "editorial_delivery": {
      "format": "PNG",
      "dimensions": "3840x2160",
      "bit_depth": "8 bits per channel",
      "colour_space": "Rec.709 gamma 2.4",
      "naming": "JRB_Documentary_Opening_Still_v01_3840x2160.png"
    },
    "review_proxy": {
      "format": "JPEG",
      "dimensions": "1920x1080",
      "quality_percent": 92,
      "colour_space": "sRGB",
      "naming": "JRB_Documentary_Opening_Still_v01_REVIEW.jpg",
      "restriction": "The JPEG is for approval only and must not be used as the production source."
    },
    "downscale_rule": "Create all lower-resolution versions from the 3840 by 2160 flattened PNG using a high-quality downsampling filter. Never enlarge a review proxy or use a proxy to rebuild the 4K master."
  },
  "quality_control": {
    "mandatory_checks": [
      {
        "check": "Source identity",
        "pass_condition": "The visible logo is demonstrably derived from the supplied 1600 by 546 file, not recreated by a model, traced, redrawn, or manually retyped."
      },
      {
        "check": "Native geometry",
        "pass_condition": "The official artwork remains exactly 1600 pixels wide and 546 pixels high with the exact aspect ratio 800:273 and a scale factor of 1."
      },
      {
        "check": "Default placement",
        "pass_condition": "The logo top-left coordinate is x 1120 and y 807, placing its geometric centre at x 1920 and y 1080."
      },
      {
        "check": "Optical-nudge compliance",
        "pass_condition": "If a documented optical nudge is used, final x remains between 1112 and 1128 and final y remains between 803 and 811. Width and height remain exactly 1600 by 546."
      },
      {
        "check": "No card effect",
        "pass_condition": "At normal viewing distance and under an exaggerated contrast inspection, there is no rectangular colour change, boundary, shadow, outline, glass effect, or patch surrounding the logo."
      },
      {
        "check": "Edge integrity",
        "pass_condition": "At 200 percent and 400 percent zoom, every monogram edge, wordmark letter, italic tagline letter, and punctuation mark is clean, continuous, and free of halos."
      },
      {
        "check": "Colour fidelity",
        "pass_condition": "Logo colours visually match the source when both are viewed through the same colour profile. Any measurable variance must result only from profile conversion, not creative grading."
      },
      {
        "check": "Contrast",
        "pass_condition": "The grey wordmark and tagline remain immediately legible on a calibrated Rec.709 display, a typical laptop display, and a phone at 50 percent brightness."
      },
      {
        "check": "Background cleanliness",
        "pass_condition": "No accidental pseudo-text, fake symbol, numeric mark, flag-like shape, seal-like circle, chart, arrow, or recognisable institutional emblem appears."
      },
      {
        "check": "Texture restraint",
        "pass_condition": "Texture is perceptible at 100 percent zoom but reads only as material richness at normal fit-to-screen viewing."
      },
      {
        "check": "Broadcast values",
        "pass_condition": "There are no illegal luminance peaks, crushed shadow regions, banding in gradients, or visible eight-bit posterization after Rec.709 conversion."
      },
      {
        "check": "Compression resilience",
        "pass_condition": "After a test H.264 export at the documentary delivery bitrate, fine lines do not shimmer and the native logo edges do not display ringing."
      },
      {
        "check": "Thumbnail behaviour",
        "pass_condition": "At 320 by 180 pixels, the green JRB monogram remains recognisable and the complete lockup retains its intended silhouette. Fine tagline legibility is not required at this extreme reduction, but it must not become a noisy or haloed band."
      },
      {
        "check": "Aesthetic standard",
        "pass_condition": "The final image reads as a premium documentary frame first and an institutional brand introduction second, never as a promotional flyer, logo card, or corporate slide."
      }
    ],
    "rejection_triggers": [
      "Any misspelling, malformed letter, lost punctuation, or damaged tagline character",
      "Any AI-generated, manually reconstructed, traced, or substituted version of the logo",
      "Any logo dimension other than exactly 1600 by 546 pixels in the 3840 by 2160 master",
      "Any unapproved logo position outside x 1112 to 1128 or y 803 to 811",
      "A visible light rectangle, patch, card, plaque, glass box, shadow box, or panel behind the logo",
      "Excessive gold, glow, flare, particles, or dramatic effects",
      "Background detail that enters the 1800 by 746 pixel logo exclusion zone and competes with the artwork",
      "A background that implies fabricated financial data or official evidence",
      "Banding, low-resolution texture, JPEG artefacts, or edge halos",
      "Any resampling softness caused by scaling the native-size asset",
      "A composition that resembles a conference backdrop, presentation cover, bank commercial, or political graphic"
    ],
    "final_approval_question": "Does the frame communicate that JRB is a serious coordinating public institution before the viewer consciously notices any decorative treatment? If the answer is not immediately yes, reduce the treatment rather than adding more effects."
  }
}
```
