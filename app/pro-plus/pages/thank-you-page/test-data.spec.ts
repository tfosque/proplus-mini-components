export module ThankYouData {
    export const getSubmitOrderResult = {
        res1: {
            result: {
                orderNumber: null,
                ATGFailedStatus: null,
                mincronResponseError: false,
                orderHistoryListLinkUrl:
                    '/myAccount/orderHistory?activeTab=orderHistory&cleanSearchOpt=true',
                ATGOrderError: false,
                orderNumberTips: null,
                state: 'SUBMITTED',
                orderHistoryDetailLinkUrl: null,
                orderConfirmationTips: 'Your Order Is Being Processed',
            },
            success: true,
            messages: null,
        },
        res2: {
            result: {
                orderNumber: 'FX10326',
                ATGFailedStatus: null,
                mincronResponseError: false,
                orderHistoryListLinkUrl: null,
                ATGOrderError: false,
                orderNumberTips: 'to view your order #FX10326',
                state: 'SEND_ORDER_SUCCESS',
                orderHistoryDetailLinkUrl:
                    '/myAccount/orderHistoryDetail?activeTab=orderHistory&orderNum=FX10326&accountToken=6Et25HRgmayBKQqI6CTW-6jRbIzsOEYHOn2J2u4s-wg=',
                orderConfirmationTips: 'YOUR ORDER HAS BEEN SUBMITTED FOR APPROVAL',
            },
            success: true,
            messages: null,
        },
    };

    export const submitCurrentOrder = {
        response: {
            result: {
                jobName: '2200 COOPER ST',
                additionalRecipients: ['stephen.goguen@becn.com'],
                instructions: 'TEST TEST TEST TEST',
                approverEmail: null,
                deliveryTime: '8',
                approverLastName: null,
                nextPage: {
                    nextUrl: '/checkout/orderConfirmation?inPipeline=true',
                },
                shippingMethod: 'Pick_up',
                orderSummary: {
                    total: 54.16,
                    displayTotalMsg: false,
                    totalMsg: null,
                },
                poName: 'TEST PO',
                approverFirstName: null,
                shippingAddress: {
                    country: null,
                    lastName: null,
                    address3: null,
                    address2: '14200 E MONCRIEFF PLACE',
                    city: 'AURORA',
                    address1: 'BEACON BUILDING PRODUCTS',
                    nickName: null,
                    postalCode: '80011-1647',
                    branchName: 'DENVER HUB BRANCH',
                    states: null,
                    firstName: null,
                    phoneNumber: '7203029965',
                    state: 'Colorado',
                },
                deliveryDate: '08-14-2020',
                deliveryOption: 'scheduled',
                items: [
                    {
                        commerceItemId: 'ci2806001316',
                        productImageUrl:
                            '/images/large/455016_default_thumb.jpg',
                        unitPrice: 54.16,
                        uom: 'BDL',
                        quantity: 1,
                        itemOrProductDescription:
                            'GAF 17" x 34-1/2" Camelot&reg; II Shingles Antique Slate',
                        productId: 'C-455016',
                        totalPrice: 54.16,
                        vendorColorId: null,
                        catalogRefId: '455016',
                        url:
                            '/productDetail/C-455016?skuId=455016&Color=Antique+Slate&Dimension=17%22+x+34-1%2F2%22',
                    },
                ],
                jobNumber: '01',
            },
            success: true,
            messages: [
                {
                    code: null,
                    type: 'success',
                    value: 'Thank you for your order!',
                    key: null,
                },
            ],
        },
    };

    export const cartItems = {
        result: {
            atgOrderId: 'o32041964',
            cartLineItems: 1,
            items: [
                {
                    commerceItemId: 'ci2806001316',
                    productImageUrl: '/images/large/455016_default_thumb.jpg',
                    unitPrice: 54.16,
                    uom: 'BDL',
                    quantity: 1,
                    itemOrProductDescription:
                        'GAF 17" x 34-1/2" Camelot&reg; II Shingles Antique Slate',
                    productId: 'C-455016',
                    totalPrice: 54.16,
                    vendorColorId: null,
                    catalogRefId: '455016',
                    url:
                        '/productDetail/C-455016?skuId=455016&Color=Antique+Slate&Dimension=17%22+x+34-1%2F2%22',
                },
            ],
            lastSelectedJob: {
                jobName: '2200 COOPER ST',
                jobNumber: '01',
            },
        },
        success: true,
        messages: null,
    };

    export const orderSummary = {
        result: {
            total: 58.76,
            itemsTotal: 54.16,
            displayTotalMsg: false,
            otherCharges: 0,
            displayOtherChargeTBD: true,
            tax: 4.6,
            totalMsg: null,
            displayTaxTBD: false,
        },
        success: true,
        messages: null,
    };
}

// module ThankYouSavedOrder {
//     export const approveSavedOrder = {
//         'result': null,
//         'success': true,
//         'messages': [
//             {
//                 'code': null,
//                 'type': 'success',
//                 'value': 'Approve order successfully.',
//                 'key': null
//             }
//         ]
//     };
//     export const getSubmitOrderResultPending = {
//         'result': {
//             'orderNumber': null,
//             'ATGFailedStatus': null,
//             'mincronResponseError': false,
//             'orderHistoryListLinkUrl': '/myAccount/orderHistory?activeTab=orderHistory&cleanSearchOpt=true',
//             'ATGOrderError': false,
//             'orderNumberTips': null,
//             'state': 'SUBMITTED',
//             'orderHistoryDetailLinkUrl': null,
//             'orderConfirmationTips': 'Your Order Is Being Processed'
//         },
//         'success': true,
//         'messages': null
//     };
//     export const getSubmitOrderResultComplete = {
//         'result': {
//             'orderNumber': 'FX10333',
//             'ATGFailedStatus': null,
//             'mincronResponseError': false,
//             'orderHistoryListLinkUrl': null,
//             'ATGOrderError': false,
//             'orderNumberTips': 'to view your order #FX10333',
//             'state': 'SEND_ORDER_SUCCESS',
//             'orderHistoryDetailLinkUrl': '/myAccount/orderHistoryDetail?activeTab=orderHistory&orderNum=FX10333&accountToken=nn7iPSDa-zMBFHRkI9QoI5-MFyIHQX9UHZCbS6CdpcQ=',
//             'orderConfirmationTips': 'YOUR ORDER HAS BEEN SUBMITTED FOR APPROVAL'
//         },
//         'success': true,
//         'messages': null
//     };
//     export const getSavedOrderConfirmationInfo2 = {
//         'result': {
//             'instructions': 'TEST TEST TEST TEST',
//             'expressDeliveryTimes': null,
//             'contactInfo': {
//                 'firstName': null,
//                 'lastName': null,
//                 'phoneNumber': '7203029965',
//                 'nickName': null
//             },
//             'otherCharges': 0,
//             'approvedBy': null,
//             'taxes': 4.6,
//             'subTotal': 58.76,
//             'submittedDate': '08-13-2020',
//             'organizationId': 'org15100391',
//             'emailAddress': [
//                 'stephen.goguen@becn.com'
//             ],
//             'rejectReason': null,
//             'storeLocatorItemId': '6368',
//             'requiredFields': {
//                 'jobName': null,
//                 'country': null,
//                 'instructions': null,
//                 'lastName': null,
//                 'address3': null,
//                 'contactInfo': null,
//                 'deliveryTime': null,
//                 'address2': null,
//                 'city': null,
//                 'address1': null,
//                 'nickName': null,
//                 'postalCode': null,
//                 'shippingMethod': null,
//                 'branchName': null,
//                 'firstName': null,
//                 'phoneNumber': null,
//                 'jobAccounts': true,
//                 'shippingAddress': null,
//                 'state': null,
//                 'deliveryDate': null,
//                 'deliveryOption': null,
//                 'po': false
//             },
//             'rejectUserDisplayText': null,
//             'displayOtherChargeTBD': true,
//             'serverTime': null,
//             'id': '221000037',
//             'addressBook': null,
//             'createdUser': 'user36110034',
//             'commerceItems': [
//                 {
//                     'itemNumber': '455016',
//                     'quantity': 1,
//                     'color': null,
//                     'mincronDescription': 'GAF MV CAMELOT II AR ANT SLATE',
//                     'productId': 'C-455016',
//                     'vendorColorId': null,
//                     'pdpUrl': 'https://beaconproplus.com/productDetail/C-455016?skuId=455016&Color=Antique+Slate&Dimension=17%22+x+34-1%2F2%22',
//                     'description': 'GAF 17" x 34-1/2" Camelot&reg; II Shingles Antique Slate',
//                     'subTotal': 54.16,
//                     'messageMap': null,
//                     'MFG': null,
//                     'thumbImageUrl': 'https://beaconproplus.com/images/large/455016_default_thumb.jpg',
//                     'uom': 'BDL',
//                     'deleteStatus': null,
//                     'itemGrayOutLevel': 'none',
//                     'price': 54.16,
//                     'imageUrl': 'https://beaconproplus.com/images/large/455016_default_hero.jpg',
//                     'messageCode': null,
//                     'siteId': null,
//                     'id': '221500302',
//                     'hasBranchAvailability': false
//                 }
//             ],
//             'assignApproval': {
//                 'name': null,
//                 'messageCode': null,
//                 'id': null,
//                 'messageMap': null,
//                 'email': null
//             },
//             'deliveryTimes': null,
//             'postponeDeliveryHour': null,
//             'shippingMethod': 'Pick Up In Store',
//             'readOnly': null,
//             'shippingMethodValue': 'Pick_up',
//             'submittedUser': null,
//             'creationDate': '08-13-2020',
//             'displaySubTotalMsg': false,
//             'firstName': null,
//             'addressBooks': null,
//             'displayTaxTBD': false,
//             'job': {
//                 'jobName': '2200 COOPER ST',
//                 'jobNumberDisplayName': null,
//                 'jobNameMandatory': false,
//                 'jobNumberMandatory': true,
//                 'jobNumber': '01'
//             },
//             'deliveryOption': 'Schedule Delivery Or Pick-Up',
//             'showDeliveryNotification': true,
//             'submittedUserEmail': null,
//             'accountNameOriginal': 'TEST DENVER',
//             'status': 'SAVEDORDER_APPROVED',
//             'shippingAddressTitle': 'Store Pick-up Address',
//             'lastName': null,
//             'assignApprovalDisplayText': null,
//             'deliveryTime': '4 PM',
//             'accountName': null,
//             'displayName': 'steve-2020-08-12-O1',
//             'timeZoneOffset': null,
//             'branchAddress': {
//                 'country': '',
//                 'phoneNumber': '7203029965',
//                 'address3': null,
//                 'address2': '14200 E MONCRIEFF PLACE',
//                 'branchNumber': null,
//                 'city': 'AURORA',
//                 'address1': 'BEACON BUILDING PRODUCTS',
//                 'displayName': 'DENVER HUB BRANCH',
//                 'postalCode': '80011-1647',
//                 'stateValue': 'CO',
//                 'state': 'Colorado'
//             },
//             'rejectUser': {
//                 'name': null,
//                 'messageCode': null,
//                 'id': null,
//                 'messageMap': null,
//                 'email': null
//             },
//             'subTotalMsg': null,
//             'mincronId': null,
//             'statusDisplayName': null,
//             'deleteStatus': null,
//             'lastModifiedUser': 'user36110034',
//             'deliveryDate': '08-14-2020',
//             'shippingMethods': [
//                 {
//                     'displayName': 'Pick Up In Store',
//                     'disabled': null,
//                     'value': 'Pick_up',
//                     'selected': true
//                 },
//                 {
//                     'displayName': 'Shipping To Address',
//                     'disabled': null,
//                     'value': 'Ship_to',
//                     'selected': false
//                 }
//             ],
//             'branchAddressTimeZoneId': null,
//             'createdUserEmail': null,
//             'lastModifiedDate': '08-13-2020',
//             'timeZoneId': null,
//             'branchName': 'DENVER HUB BRANCH',
//             'lastModifiedUserEmail': null,
//             'accountBranchState': null,
//             'accountNumber': '280381',
//             'lastModifiedUserName': null,
//             'messageMap': null,
//             'deliveryOptions': [
//                 {
//                     'displayName': 'Schedule Delivery Or Pick-Up',
//                     'disabled': null,
//                     'value': 'scheduled',
//                     'selected': true
//                 },
//                 {
//                     'displayName': 'Place Order On Hold',
//                     'disabled': null,
//                     'value': 'onHold',
//                     'selected': false
//                 }
//             ],
//             'itemsTotal': 54.16,
//             'jobAccounts': {
//                 'unavailableMsg': null,
//                 'unavailable': null,
//                 'jobs': [
//                     {
//                         'jobName': '2200 COOPER ST',
//                         'jobNumberDisplayName': null,
//                         'jobNameMandatory': null,
//                         'jobNumberMandatory': null,
//                         'jobNumber': '01',
//                         'selected': true
//                     },
//                     {
//                         'jobName': 'SHOP ACCOUNT',
//                         'jobNumberDisplayName': null,
//                         'jobNameMandatory': null,
//                         'jobNumberMandatory': null,
//                         'jobNumber': 'SHOP',
//                         'selected': false
//                     }
//                 ]
//             },
//             'messageCode': null,
//             'shippingAddress': {
//                 'country': '',
//                 'address3': null,
//                 'address2': '14200 E MONCRIEFF PLACE',
//                 'city': 'AURORA',
//                 'address1': 'BEACON BUILDING PRODUCTS',
//                 'postalCode': '80011-1647',
//                 'state': 'Colorado',
//                 'states': null
//             },
//             'siteId': 'homeSite',
//             'deliveryOptionValue': 'scheduled',
//             'thankYouMsg': 'Thank you! Your order has been submitted for approval.',
//             'po': 'TEST PO 123',
//             'submittedUserName': null
//         },
//         'success': true,
//         'messages': [
//             {
//                 'code': null,
//                 'type': 'success',
//                 'value': 'Get saved order success',
//                 'key': null
//             }
//         ]
//     };

// }
