RUN_TESTS=1 LATTE_SUITES='["iit behaviour"]' meteor --once &&
RUN_TESTS=1 LATTE_SUITES='["if there is a ddescribe block"]' meteor --once &&
RUN_TESTS=1 LATTE_SUITES='["ddescribe should take precedence over iit blocks"]' meteor --once &&
RUN_TESTS=1 LATTE_SUITES='["~iit behaviour", "~if there is a ddescribe block", "~ddescribe should take precedence over iit blocks", "~describe block containing an iit block, in presence of a ddescribe block", "~unnested describe blocks in presence of a ddescribe block", "~first ddescribe", "~second ddescribe"]' meteor --once

