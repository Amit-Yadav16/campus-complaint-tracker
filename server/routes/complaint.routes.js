const router = require('express').Router();
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');
const {
  list, create, getOne, patchStage, postResolution, postConfirm,
} = require('../controllers/complaint.controller');

router.use(authMiddleware);

// Students: create + read their own  |  Admin/HOD: read all in scope
router.get('/', list);
router.post('/', requireRole('student'), create);
router.get('/:id', getOne);

// Stage progression — admin or HOD only
router.patch('/:id/stage', requireRole('admin', 'hod'), patchStage);

// Resolution proposal — admin or HOD only; CANNOT directly close
router.post('/:id/resolution', requireRole('admin', 'hod'), postResolution);

// Student YES/NO confirmation
router.post('/:id/confirm', requireRole('student'), postConfirm);

module.exports = router;
