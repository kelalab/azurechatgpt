import { expect, test } from 'vitest'
import { makePaths } from './util'
import { Path } from './types'

test(`
const navTree: Path = {
    path: '/',
    name: 'Koti',
    children: [
    ]
}
`, () => {
    const navTree: Path = {
        path: '/',
        name: 'Koti',
        children: [
        ]
    }
    const paths = makePaths(navTree);
    expect(paths.size).toBe(1);
    expect(paths.get('/')?.name).toBe('Koti')
})


test(`
const navTree: Path = {
    path: '/',
    name: 'Koti',
    children: [
        {
            name: 'Omat',
            children: [
                {
                    path: '/a',
                    name: 'a',
                }
            ]
        }
    ]
}
`, () => {
    const navTree: Path = {
        path: '/',
        name: 'Koti',
        children: [
            {
                name: 'Omat',
                children: [
                    {
                        path: '/a',
                        name: 'a',
                    }
                ]
            }
        ]
    }
    const paths = makePaths(navTree);
    expect(paths.size).toBe(2);
    expect(paths.get('/')?.name).toBe('Koti')
    expect(paths.get('/a')?.name).toBe('a')
    expect(paths.get('/a')?.parent?.name).toBe('Koti')
})