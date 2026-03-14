"""
Background scheduler for cron-style jobs (e.g. recipe suggestions for notifications).
"""
from apscheduler.schedulers.background import BackgroundScheduler


def run_recipe_suggestions_job(app):
    """Job: query inventory, LLM suggestions, store RecipeSuggestions (for notifications)."""
    with app.app_context():
        db = getattr(app, "db", None)
        if not db:
            return
        from service.recipe_suggestion_service import RecipeSuggestionService
        RecipeSuggestionService(db).run_cron_suggestions()


def start_scheduler(app):
    """
    Start the background scheduler. Call once after the Flask app and db are set.
    Runs recipe-suggestions job daily at 08:00.
    """
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        func=run_recipe_suggestions_job,
        trigger="cron",
        hour=8,
        minute=0,
        id="recipe_suggestions",
        replace_existing=True,
        args=[app],
    )
    scheduler.start()
    return scheduler
