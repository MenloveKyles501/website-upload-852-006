document.addEventListener("DOMContentLoaded", () => {
    const mobileToggle = document.querySelector("[data-mobile-toggle]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener("click", () => {
            mobilePanel.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-site-search]").forEach((form) => {
        form.addEventListener("submit", (event) => {
            const input = form.querySelector("input[name='q']");
            if (!input || !input.value.trim()) {
                event.preventDefault();
            }
        });
    });

    document.querySelectorAll("[data-hero]").forEach((hero) => {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let current = 0;
        let timer = null;

        const show = (index) => {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        };

        const start = () => {
            stop();
            timer = window.setInterval(() => show(current + 1), 5200);
        };

        const stop = () => {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };

        if (prev) {
            prev.addEventListener("click", () => {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", () => {
                show(current + 1);
                start();
            });
        }

        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                show(index);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    });

    document.querySelectorAll("[data-filter-scope]").forEach((scope) => {
        const searchInput = scope.querySelector("[data-page-search]");
        const yearSelect = scope.querySelector("[data-year-filter]");
        const typeSelect = scope.querySelector("[data-type-filter]");
        const cards = Array.from(scope.querySelectorAll("[data-movie-card]"));
        const emptyState = scope.querySelector("[data-empty-state]");
        const params = new URLSearchParams(window.location.search);
        const queryValue = params.get("q") || "";

        if (searchInput && queryValue) {
            searchInput.value = queryValue;
        }

        const apply = () => {
            const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
            const year = yearSelect ? yearSelect.value : "";
            const type = typeSelect ? typeSelect.value : "";
            let visible = 0;

            cards.forEach((card) => {
                const searchText = (card.getAttribute("data-search") || "").toLowerCase();
                const cardYear = card.getAttribute("data-year") || "";
                const cardType = card.getAttribute("data-type") || "";
                const matched = (!query || searchText.includes(query)) && (!year || cardYear.includes(year)) && (!type || cardType.includes(type));
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible > 0;
            }
        };

        [searchInput, yearSelect, typeSelect].forEach((control) => {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    });
});
