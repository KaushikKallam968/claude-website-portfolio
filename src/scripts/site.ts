import { startClocks } from './clock';
import { startNotes } from './notes';
import { startReadout } from './readout';
import { rememberOrigins, restoreIfPending, restoreOnPageShow, wireDisclosures, wireTopBar } from './navigation';
import { startMotion } from './motion';

restoreIfPending();
restoreOnPageShow();
startClocks();
startNotes();
startReadout();
rememberOrigins();
wireDisclosures();
wireTopBar();
startMotion();
