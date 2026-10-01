import { startClocks } from './clock';
import { startNotes } from './notes';
import { startReadout } from './readout';
import { rememberOrigins, restoreFocusOnBack, restoreIfPending, restoreOnPageShow, wireAnchorJumps, wireDisclosures, wireLivePause, wireTopBar, wireTopWhere, wireRowLinks } from './navigation';
import { startMotion } from './motion';
import { startLens } from './lens';

wireLivePause();
const restored = restoreIfPending();
restoreOnPageShow();
restoreFocusOnBack();
startClocks();
startNotes();
startReadout();
rememberOrigins();
wireDisclosures();
// Before the bar: a page opened at a fragment is moved onto it as it loads, and the bar then takes its place.
wireAnchorJumps(restored);
wireTopBar();
wireTopWhere();
wireRowLinks();
startLens();
startMotion();
