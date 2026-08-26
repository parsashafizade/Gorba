# Architecture

The app is a single route-driven React product with three scenario configurations. Routes key the
experience state, so switching scenarios resets the destination while the localization provider
stays mounted and preserves the chosen language.

The mascot is a shared controller backed by a typed semantic asset manifest. A fixed 2:3 stage
contains two absolute image layers. Incoming images are decoded before Motion crossfades the active
layer; a spring wrapper bridges discrete renders with a few pixels of micro-motion. Gaze, blink,
idle, emotion, preload, and reaction behavior are shared across scenarios.

Scenario copy lives entirely in i18next resources. Interaction data maps semantic events to
localized reaction keys and mascot emotions. Pure geometry modules cover gaze mapping, progressive
button scale, bounded No positioning, and local calendar generation so the behavior can be tested
without the DOM.

