from apscheduler.schedulers.background import BackgroundScheduler

from app.core.logger import logger
from app.database.session import SessionLocal
from app.services import booking_service

scheduler = BackgroundScheduler()


def _expire_no_show_bookings_job():
    db = SessionLocal()

    try:
        expired = booking_service.expire_no_show_bookings(db)

        if expired:
            logger.info(
                f"Auto-expired {len(expired)} no-show booking(s): "
                f"{[b.id for b in expired]}"
            )

    except Exception as exc:
        logger.error(f"No-show expiry job failed: {exc}")

    finally:
        db.close()


def start_scheduler():
    if scheduler.running:
        return

    scheduler.add_job(
        _expire_no_show_bookings_job,
        "interval",
        minutes=1,
        id="expire_no_show_bookings",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("No-show expiry scheduler started (runs every 1 minute).")


def shutdown_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
