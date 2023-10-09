import { Injectable, ComponentRef, Injector } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import {
    ComponentPortal,
    PortalInjector,
    ComponentType,
} from '@angular/cdk/portal';
import { ModalOverlayRef } from '../global-classes/modal-overlay-ref';
import { MODAL_OVERLAY_DATA } from '../misc-utils/modal-overlay.tokens';

// A config interface to define options available when components open a modal
interface ModalConfig {
    panelClass?: string;
    hasBackdrop?: boolean;
    backdropClass?: string;
    data?: any;
}

// Default config in case not all config options are provided on open.
const DEFAULT_CONFIG: ModalConfig = {
    hasBackdrop: true,
    backdropClass: 'modal__backdrop',
    panelClass: 'modal__panel',
};

@Injectable({
    providedIn: 'root',
})
export class ModalService {
    constructor(private injector: Injector, private overlay: Overlay) {}

    /**
     * Takes in a ModalConfig object and builds out an OverlayConfig that includes a position and scrolling strategy
     * @param config Combined default and custom config object.
     */
    private getOverlayConfig(config: ModalConfig): OverlayConfig {
        const positionStrategy = this.overlay
            .position()
            .global()
            .centerHorizontally()
            .centerVertically();

        const overlayConfig = new OverlayConfig({
            hasBackdrop: config.hasBackdrop,
            backdropClass: config.backdropClass,
            panelClass: config.panelClass,
            scrollStrategy: this.overlay.scrollStrategies.block(),
            positionStrategy,
        });

        return overlayConfig;
    }

    /**
     * Takes in a ModalConfig and returns the OverlayRef from the material cdk Overlay service
     * @param config Combined default and custom config object.
     */
    private createOverlay(config: ModalConfig) {
        // Returns an OverlayConfig
        const overlayConfig = this.getOverlayConfig(config);

        // Returns an OverlayRef
        return this.overlay.create(overlayConfig);
    }

    /**
     * Returns a new PortalInjector allowing us to inject custom data into the new OverlayRef
     * @param config Combined default and custom config object.
     * @param modalOverlayRef Our "remote control" reference to the new OverlayRef.
     */
    private createInjector(
        config: ModalConfig,
        modalOverlayRef: ModalOverlayRef
    ): PortalInjector {
        // Instantiate new WeakMap for our custom injection tokens
        const injectionTokens = new WeakMap();

        // Set custom injection tokens
        injectionTokens.set(ModalOverlayRef, modalOverlayRef);
        injectionTokens.set(MODAL_OVERLAY_DATA, config.data);

        // Instantiate new PortalInjector
        return new PortalInjector(this.injector, injectionTokens);
    }

    /**
     * Attaches our component portal to the OverlayRef PortalOutlet using a custom injector.
     * @param overlayRef Reference to the overlay created by the angular material cdk Overlay service
     * @param config Combined default and custom config object.
     * @param modalOverlayRef Our "remote control" reference to the new OverlayRef.
     * @param component the component to insert into the modal
     */
    private attachModalContainer<T>(
        overlayRef: OverlayRef,
        config: ModalConfig,
        modalOverlayRef: ModalOverlayRef,
        component: ComponentType<T>
    ) {
        const injector = this.createInjector(config, modalOverlayRef);

        const containerPortal = new ComponentPortal(component, null, injector);
        const containerRef: ComponentRef<T> = overlayRef.attach(
            containerPortal
        );

        return containerRef.instance;
    }

    /**
     * Creates a new overlay using the passed in config options and returns a "remoteControl" reference to the new modal
     * to enable it to be controlled in the opening component.
     * @param component the component to insert into the modal
     * @param config Optional: ModalConfig object receieved from component calling this service.
     */
    open<T>(
        component: ComponentType<T>,
        config: ModalConfig = {}
    ): ModalOverlayRef {
        // Override default configuration
        const modalConfig = { ...DEFAULT_CONFIG, ...config };

        // Returns an OverlayRef which is a PortalHost
        const modalRef = this.createOverlay(modalConfig);

        // Instantiate remote control
        const modalOverlayRef = new ModalOverlayRef(modalRef);

        // const modalOverlayComponent = this.attachModalContainer<T>(modalRef, modalConfig, modalOverlayRef, component);
        this.attachModalContainer<T>(
            modalRef,
            modalConfig,
            modalOverlayRef,
            component
        );

        // Close the modal when it's backdrop is clicked.
        modalRef.backdropClick().subscribe(() => {
            modalOverlayRef.close();
        });

        return modalOverlayRef;
    }
}
