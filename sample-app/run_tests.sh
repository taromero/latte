NODE_ENV=test LATTE_MODE=run LATTE_SUITES='["iit behaviour"]' meteor --once &&
NODE_ENV=test LATTE_MODE=run LATTE_SUITES='["if there is a ddescribe block"]' meteor --once &&
NODE_ENV=test LATTE_MODE=run LATTE_SUITES='["ddescribe should take precedence over iit blocks"]' meteor --once &&
NODE_ENV=test LATTE_MODE=run LATTE_SUITES='["~iit behaviour", "~if there is a ddescribe block", "~ddescribe should take precedence over iit blocks", "~describe block containing an iit block, in presence of a ddescribe block", "~unnested describe blocks in presence of a ddescribe block", "~first ddescribe", "~second ddescribe"]' meteor --once

