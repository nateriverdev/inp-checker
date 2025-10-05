
// scripts/check-deps.js
import fs from 'fs';
import path from 'path';
import semver from 'semver';
import lockfile from '@yarnpkg/lockfile';
const { parse: parseYarnLock } = lockfile

const packagesToCheck = {
    "ansi-styles": "6.2.2",
    "debug": "4.4.2",
    "chalk": "5.6.1",
    "supports-color": "10.2.1",
    "strip-ansi": "7.1.1",
    "ansi-regex": "6.2.1",
    "wrap-ansi": "9.0.1",
    "color-convert": "3.1.1",
    "color-name": "2.0.1",
    "is-arrayish": "0.3.3",
    "slice-ansi": "7.1.1",
    "color": "5.0.1",
    "color-string": "2.1.1",
    "simple-swizzle": "0.2.3",
    "supports-hyperlinks": "4.1.1",
    "has-ansi": "6.0.1",
    "chalk-template": "1.1.1",
    "backslash": "0.2.1"
};

const rootPaths = [
    "/Users/near/Documents/WORK/brands/fe-sut88-main",
    "/Users/near/Documents/WORK/brands/fe-188bet-main",
    "/Users/near/Documents/WORK/brands/fe-online",
    "/Users/near/Documents/WORK/brands/fe-pub88-main",
    "/Users/near/Documents/WORK/brands/fe-zo88-main",
    "/Users/near/Documents/WORK/brands/fe-zik88-main",
    "/Users/near/Documents/WORK/brands/fe-via88-main",
    "/Users/near/Documents/WORK/brands/fe-dv88-main",
    "/Users/near/Documents/WORK/brands/fe-hbet-main",
    "/Users/near/Documents/WORK/brands/fe-sv99-main",
    "/Users/near/Documents/WORK/brands/fe-phombet-main",
    "/Users/near/Documents/WORK/brands/9677",
    "/Users/near/Documents/WORK/brands/9675"
];

// check nếu installed version satisfies requested
// function matchesVersion(installed, requested) {
//     if (!installed) return false;
//     try {
//         return semver.satisfies(installed, requested, { includePrerelease: true });
//     } catch {
//         return false;
//     }
// }

function matchesVersion(installed, requested) {
    if (!installed) return false;
    const installedVersion = semver.clean(installed); // "8.1.1" từ "^8.1.1"
    const requestedVersion = semver.clean(requested); // "10.2.1" từ "^10.2.1"
    return installedVersion === requestedVersion;
}






function checkPackageJsonDeps(root) {
    const pkgJsonPath = path.join(root, 'package.json');
    if (!fs.existsSync(pkgJsonPath)) return [];
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
    const allDeps = { ...(pkgJson.dependencies || {}), ...(pkgJson.devDependencies || {}) };

    return Object.entries(packagesToCheck)
        .map(([pkg, wanted]) => {
            const installed = allDeps[pkg];
            if (!installed) return null;
            return { pkg, wanted, installed };
        })
        .filter(Boolean);
}

function checkYarnLockDeps(root) {
    const lockPath = path.join(root, 'yarn.lock');
    if (!fs.existsSync(lockPath)) return [];
    const lockContent = fs.readFileSync(lockPath, 'utf-8');
    const { object } = parseYarnLock(lockContent);

    return Object.entries(packagesToCheck)
        .map(([pkg, wanted]) => {
            const keys = Object.keys(object).filter(k => k.startsWith(pkg + '@'));
            for (const key of keys) {
                const installedVersion = object[key].version;
                if (matchesVersion(installedVersion, wanted)) {
                    return { pkg, wanted, installed: installedVersion };
                }
            }
            return null;
        })
        .filter(Boolean);
}

// main
rootPaths.forEach(root => {
    console.log(`\nProject: ${root}`);

    const pkgMatches = checkPackageJsonDeps(root);
    if (pkgMatches.length > 0) {
        console.log('  package.json matches:');
        pkgMatches.forEach(m => {
            console.log(`    ${m.pkg}@${m.wanted} (requested), installed: ${m.installed}`);
        });
    } else {
        console.log('  No matches in package.json');
    }

    const lockMatches = checkYarnLockDeps(root);
    if (lockMatches.length > 0) {
        console.log('  yarn.lock matches:');
        lockMatches.forEach(m => {
            console.log(`    ${m.pkg}@${m.wanted} (requested), installed: ${m.installed}`);
        });
    } else {
        console.log('  No matches in yarn.lock');
    }
});
