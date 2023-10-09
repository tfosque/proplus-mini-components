import { UserService } from '../../pro-plus/services/user.service';
import { CmsLinksService } from './cms-links.service';
import { joinUrlPaths } from '../classes/safeParseUrl';

describe('CmsLinksService', () => {
    //  We only need an account number to test the service
    const fakeUserService: UserService = { accountId: 1234 } as any;
    const cmsService = new CmsLinksService(fakeUserService);

    describe('fixCMSUrl', () => {
        it('should break a local URL into parts', () => {
            const result = cmsService.getLink(
                '/search?frequentlyPurchased=true'
            );
            expect(result.href).toBe(
                'https://mytestdomain.xyz/search?frequentlyPurchased=true'
            );
            expect(result.path).toBe('/search');
            expect(result.isFullyQualified).toBe(false);
            expect(result.parameters).toEqual({ frequentlyPurchased: 'true' });
        });

        it('should break a fully qualified URL into parts', () => {
            const result = cmsService.getLink(
                'https://mytestdomain.xyz/search?frequentlyPurchased=true'
            );
            expect(result.href).toBe(
                'https://mytestdomain.xyz/search?frequentlyPurchased=true'
            );
            expect(result.path).toBe('/search');
            expect(result.isFullyQualified).toBe(true);
            expect(result.parameters).toEqual({ frequentlyPurchased: 'true' });
        });

        it('should be able to inject an account number into the path', () => {
            const result = cmsService.getLink(
                '/account-no/{ACCOUNTNO}/details'
            );
            expect(result.path).toBe('/account-no/1234/details');
        });

        it('should be able to separate the URL parameters from the URL', () => {
            expect(
                cmsService.getLink(
                    'https://mytestdomain.xyz/123/456/789/ZZ?a=1&b=2&c=3'
                )
            ).toEqual({
                href: 'https://mytestdomain.xyz/123/456/789/ZZ?a=1&b=2&c=3',
                origin: 'https://mytestdomain.xyz',
                path: '/123/456/789/ZZ',
                isFullyQualified: true,
                parameters: {
                    a: '1',
                    b: '2',
                    c: '3',
                },
            });
        });

        it('should be able to recognize a partial link', () => {
            expect(cmsService.getLink('/123/456/789/ZZ?a=1&b=2&c=3')).toEqual({
                href: 'https://mytestdomain.xyz/123/456/789/ZZ?a=1&b=2&c=3',
                origin: '',
                path: '/123/456/789/ZZ',
                isFullyQualified: false,
                parameters: {
                    a: '1',
                    b: '2',
                    c: '3',
                },
            });
        });
    });

    describe('joinUrlPaths', () => {
        it('should join the paths', () => {
            expect(joinUrlPaths('https://mytestdomain.xyz', '123')).toBe(
                'https://mytestdomain.xyz/123'
            );
            expect(joinUrlPaths('123', '/456/', '/789', 'ZZ')).toBe(
                '123/456/789/ZZ'
            );
        });
    });
});
