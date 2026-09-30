import { startClocks } from './clock';
import { startNotes } from './notes';
import { startReadout } from './readout';
import { rememberOrigins, restoreIfPending, restoreOnPageShow, wireDisclosures, wireLivePause, wireTopBar, wireTopWhere } from './navigation';
import { startMotion } from './motion';
import { startLens } from './lens';

wireLivePause();
restoreIfPending();
restoreOnPageShow();
startClocks();
startNotes();
startReadout();
rememberOrigins();
wireDisclosures();
wireTopBar();
wireTopWhere();
startLens();
startMotion();
