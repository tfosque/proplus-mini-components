// import { Welcome } from '@storybook/angular/demo';

import { DumpGridComponent } from '../app/common-components/components/dump-grid/dump-grid.component';

export default {
    title: 'DumpGridComponent',
    component: DumpGridComponent,
};

// export default {
//   title: 'Welcome',
//   component: Welcome,
// };

export const ToStorybook = () => ({
    component: DumpGridComponent,
    props: {
        input: {
            stringValue: 'Bubba Jones',
            numeric: 42,
            date: new Date(),
            simpleObject: { x: 6, y: 9 },
        },
        maxDepth: 4,
    },
});

ToStorybook.story = {
    name: 'Main Grid',
};
