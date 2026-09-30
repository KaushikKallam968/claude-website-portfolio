import { startClocks } from './clock';
import { startNotes } from './notes';
import { startReadout } from './readout';
import { rememberOrigins, restoreIfPending, wireDisclosures, wireTopBar } from './navigation';
import { startMotion } from './motion';

restoreIfPending();
startClocks();
startNotes();
startReadout();
rememberOrigins();
wireDisclosures();
wireTopBar();
startMotion();
