// import { action } from '@storybook/addon-actions';
// import { linkTo } from '@storybook/addon-links';
// import { MatIcon } from '@angular/material';
import { ShippingFormComponent } from '../app/pro-plus/pages/checkout/shipping-form/shipping-form.component';
import { MatIconModule } from '@angular/material';
// import { ProPlusModule } from '../app/pro-plus/pro-plus.module';
import { moduleMetadata } from '@storybook/angular';

export default {
    title: 'ShippingFormComponent',
    component: ShippingFormComponent,
    decorators: [
        moduleMetadata({
            imports: [MatIconModule],
        }),
    ],
};

export const EmptyForm = () => ({
    component: ShippingFormComponent,
    props: {
        // input: 'Hello Button',
    },
});

EmptyForm.story = {
    default: 'Hi',
    // imports: [
    //   ProPlusModule,
    //   MatIconModule,
    //   MatDividerModule,
    // ]
};

// export const Emoji = () => ({
//   component: DumpGridComponent,
//   props: {
//     input: '😀 😎 👍 💯',
//   },
// });

// Emoji.story = {
//   parameters: { notes: 'My notes on a button with emojis' },
// };

// export const Grid = () => ({
//   component: DumpGridComponent,
//   props: {
//     input: [
//       { x: 5, y: 6 },
//       { x: 3, y: 7 },
//     ]
//   },
// });

// Grid.story = {
//   name: 'Arrays are laid out like grids',
//   parameters: { notes: 'We can have a lot of fun here' },
// };

// export const ButtonWithLinkToAnotherStory = () => ({
//   component: Button,
//   props: {
//     text: 'Go to Welcome Story',
//     onClick: linkTo('Welcome'),
//   },
// });

// ButtonWithLinkToAnotherStory.story = {
//   name: 'button with link to another story',
// };
