/** @odoo-module **/
import options from "@web_editor/js/editor/snippets.options";

options.registry.AppleCategCarousel = options.Class.extend({
    selector: ".s_apple_categ_carousel",

    init() {
        this._super(...arguments);
        this.orm = this.bindService("orm");
    },

    // ── Dynamic XML: build category we-select from DB ───────────────────────
    async _renderCustomXML(uiFragment) {
        const cats = await this.orm.searchRead(
            "product.public.category",
            [],
            ["id", "name"],
            { limit: 100, order: "name asc" }
        );

        const select = document.createElement("we-select");
        select.setAttribute("string", "商品分類");
        select.setAttribute("data-attribute-name", "categId");

        const allBtn = document.createElement("we-button");
        allBtn.setAttribute("data-select-data-attribute", "0");
        allBtn.textContent = "全部分類";
        select.appendChild(allBtn);

        for (const cat of cats) {
            const btn = document.createElement("we-button");
            btn.setAttribute("data-select-data-attribute", String(cat.id));
            btn.textContent = cat.name;
            select.appendChild(btn);
        }

        // Insert before the first existing we-select
        const firstSelect = uiFragment.querySelector("we-select");
        uiFragment.insertBefore(select, firstSelect);
    },

    // ── Option handlers ──────────────────────────────────────────────────────

    selectDataAttribute(previewMode, widgetValue, params) {
        this._super(...arguments);
        const attr = params.attributeName;
        const wrapper = this._getWrapper();

        // Sync the new value onto the wrapper so layout/fetch reads it
        wrapper.dataset[attr] = widgetValue;

        if (attr === "layout" || attr === "slidesPerView") {
            this._applyLayout(
                wrapper.dataset.layout || "swiper",
                parseInt(wrapper.dataset.slidesPerView || "3", 10)
            );
        }
    },

    // ── Private ──────────────────────────────────────────────────────────────

    _getWrapper() {
        // Data attrs are now on the section (this.$target[0])
        return this.$target[0];
    },

    _applyLayout(layout, slidesPerView) {
        const track = this.$target[0].querySelector(".models-track");
        if (!track) return;
        const prev = this.$target[0].querySelector(".track-prev");
        const next = this.$target[0].querySelector(".track-next");
        const bar  = this.$target[0].querySelector(".models-scrollbar");
        if (layout === "grid") {
            track.style.display = "grid";
            track.style.gridTemplateColumns = `repeat(${slidesPerView}, 1fr)`;
            track.style.gap = "24px";
            track.style.overflowX = "unset";
            if (prev) prev.style.display = "none";
            if (next) next.style.display = "none";
            if (bar)  bar.style.display  = "none";
        } else {
            track.style.display = "flex";
            track.style.gridTemplateColumns = "";
            track.style.gap = "";
            track.style.overflowX = "auto";
            if (prev) prev.style.display = "";
            if (next) next.style.display = "";
            if (bar)  bar.style.display  = "";
        }
    },

    _computeWidgetState(methodName, params) {
        if (methodName === "selectDataAttribute") {
            const wrapper = this._getWrapper();
            return wrapper.dataset[params.attributeName] || "";
        }
        return this._super(...arguments);
    },
});
