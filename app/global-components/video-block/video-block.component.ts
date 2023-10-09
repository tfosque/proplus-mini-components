import { Component, OnInit } from '@angular/core';
import { BrBaseContentComponent } from '../../core/BrBaseContentComponent';
import { BehaviorSubject } from 'rxjs';
export interface wistaWindow extends Window {
    _wq: any;
}

export interface VideoProps {
    title: string;
    videoId: string;
    caption?: string;
    alignment: 'left' | 'right' | 'center';
}
@Component({
    selector: 'app-video-block',
    templateUrl: './video-block.component.html',
    styleUrls: ['./video-block.component.scss'],
})
export class VideoBlockComponent
    extends BrBaseContentComponent
    implements OnInit
{
    public videos: VideoProps[] = [];

    // Need to know if the wista script has been loaded
    public hasWqVideo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false
    );

    constructor() {
        super();
    }

    ngOnInit() {
        this.videos = this.content?.videos || [];
    }

    public setVideoLoaded(isLoaded: boolean) {
        // when the script loader is finished, set the hasWqVideo$ to true
        this.hasWqVideo$.next(isLoaded);
    }
}
