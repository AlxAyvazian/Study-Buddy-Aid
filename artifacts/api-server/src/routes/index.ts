import { Router, type IRouter } from "express";
import healthRouter from "./health";
import sectionsRouter from "./sections";
import cardsRouter from "./cards";
import sessionsRouter from "./sessions";
import progressRouter from "./progress";
import explainRouter from "./explain";
import mediaGeneratorRouter from "./media-generator";
import analyzeRouter from "./analyze";
import premedRouter from "./premed";
import premedVaultRouter from "./premed-vault";
import disabilityRouter from "./disability";
import careerRouter from "./career";
import lettersRouter from "./letters";
import researchRouter from "./research";

const router: IRouter = Router();

router.use(healthRouter);
router.use(sectionsRouter);
router.use(cardsRouter);
router.use(sessionsRouter);
router.use(progressRouter);
router.use(explainRouter);
router.use(mediaGeneratorRouter);
router.use(analyzeRouter);
router.use(premedRouter);
router.use(premedVaultRouter);
router.use(disabilityRouter);
router.use(careerRouter);
router.use(lettersRouter);
router.use(researchRouter);

export default router;
