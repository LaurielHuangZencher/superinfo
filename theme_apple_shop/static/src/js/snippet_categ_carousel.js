/** @odoo-module **/
import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.AppleCategCarousel = publicWidget.Widget.extend({
    selector: '.s_apple_categ_carousel',
    disabledInEditableMode: true,

    _detectCategId(wrapper) {
        const explicit = wrapper.dataset.categId;
        if (explicit && explicit !== '0') return explicit;
        const match = window.location.pathname.match(/\/shop\/category\/[^/]+-(\d+)/);
        if (match) return match[1];
        return '0';
    },

    start() {
        const wrapper = this.el.querySelector('.apple-categ-carousel-wrapper');
        if (!wrapper) return this._super(...arguments);
        const categId = this._detectCategId(wrapper);
        fetch(`/theme_apple_shop/snippet/categ_carousel?categ_id=${categId}`)
            .then(r => r.text())
            .then(html => {
                wrapper.innerHTML = html;
                // Data attrs now live on the section (this.el)
                this._applyLayout(this.el, wrapper);
            });
        return this._super(...arguments);
    },

    _applyLayout(section, wrapper) {
        const layout = section.dataset.layout || 'swiper';
        const slidesPerView = parseInt(section.dataset.slidesPerView || '3', 10);
        const delay = parseInt(section.dataset.autoplayDelay || '0', 10);
        const track = wrapper.querySelector('.models-track');
        if (!track) return;

        if (layout === 'grid') {
            track.style.display = 'grid';
            track.style.gridTemplateColumns = `repeat(${slidesPerView}, 1fr)`;
            track.style.gap = '24px';
            track.style.overflowX = 'unset';
            // 隱藏輪播按鈕和 scrollbar
            const prev = wrapper.querySelector('.track-prev');
            const next = wrapper.querySelector('.track-next');
            const bar  = wrapper.querySelector('.models-scrollbar');
            if (prev) prev.style.display = 'none';
            if (next) next.style.display = 'none';
            if (bar)  bar.style.display  = 'none';
        } else {
            this._initSwiper(wrapper, delay);
        }
    },

    _initSwiper(wrapper, delay) {
        const track = wrapper.querySelector('.models-track');
        const prevBtn = wrapper.querySelector('.track-prev');
        const nextBtn = wrapper.querySelector('.track-next');
        const thumb = wrapper.querySelector('.models-scrollbar-thumb');
        const bar = wrapper.querySelector('.models-scrollbar');

        if (!track) return;

        const syncThumb = () => {
            if (!thumb || !bar) return;
            const ratio = track.scrollWidth > track.clientWidth
                ? track.clientWidth / track.scrollWidth : 1;
            if (ratio >= 1) { bar.style.display = 'none'; return; }
            bar.style.display = '';
            thumb.style.width = (ratio * 100) + '%';
            thumb.style.left = (track.scrollLeft / track.scrollWidth * 100) + '%';
        };

        track.addEventListener('scroll', syncThumb);
        syncThumb();

        if (prevBtn) prevBtn.addEventListener('click', () =>
            track.scrollBy({ left: -320, behavior: 'smooth' }));
        if (nextBtn) nextBtn.addEventListener('click', () =>
            track.scrollBy({ left: 320, behavior: 'smooth' }));

        if (thumb && bar) {
            let dragging = false, startX = 0, startScroll = 0;
            thumb.addEventListener('mousedown', e => {
                dragging = true; startX = e.clientX;
                startScroll = track.scrollLeft;
                thumb.classList.add('dragging');
            });
            document.addEventListener('mousemove', e => {
                if (!dragging) return;
                const dx = e.clientX - startX;
                track.scrollLeft = startScroll + dx * (track.scrollWidth / bar.clientWidth);
            });
            document.addEventListener('mouseup', () => {
                dragging = false; thumb.classList.remove('dragging');
            });
        }

        // 自動播放
        if (delay > 0) {
            const cards = track.querySelectorAll('.model-card');
            if (!cards.length) return;
            let idx = 0;
            setInterval(() => {
                idx = (idx + 1) % cards.length;
                cards[idx].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
            }, delay);
        }
    },
});
