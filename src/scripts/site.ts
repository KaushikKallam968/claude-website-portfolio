import { startClocks } from './clock';
import { startNotes } from './notes';
import { startReadout } from './readout';
import { rememberOrigins, restoreIfPending, restoreOnPageShow, wireDisclosures, wireLivePause, wireTopBar } from './navigation';
import { startMotion } from './motion';

wireLivePause();
restoreIfPending();
restoreOnPageShow();
startClocks();
startNotes();
startReadout();
rememberOrigins();
wireDisclosures();
wireTopBar();
startMotion();
