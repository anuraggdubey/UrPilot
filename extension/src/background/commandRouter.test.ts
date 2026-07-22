import { describe, expect, it } from 'vitest';
import { parseCommand } from './commandRouter';
import { defaultSiteTemplates } from '../lib/siteTemplates';

describe('parseCommand', () => {
  it.each([
    ['open my stuff', { intent: 'OPEN_SAVED_LINKS' }],
    ['open my requirements', { intent: 'OPEN_SAVED_LINKS' }],
    ['stop talking', { intent: 'STOP' }],
    ['summarize this page', { intent: 'SUMMARIZE_PAGE' }],
    ['read this', { intent: 'SUMMARIZE_PAGE' }]
  ])('parses %s', (transcript, expected) => {
    expect(parseCommand(transcript, defaultSiteTemplates)).toMatchObject(expected);
  });

  it('parses site search with open-site phrasing', () => {
    expect(parseCommand('open YouTube and search Stellar smart contracts', defaultSiteTemplates)).toMatchObject({
      intent: 'SITE_SEARCH',
      site: 'YouTube',
      query: 'Stellar smart contracts'
    });
  });

  it('parses site search with search-on-site phrasing', () => {
    expect(parseCommand('search vector databases on GitHub', defaultSiteTemplates)).toMatchObject({
      intent: 'SITE_SEARCH',
      site: 'GitHub',
      query: 'vector databases'
    });
  });

  it('parses chained web search and summarize', () => {
    expect(parseCommand('search Stellar Soroban docs and summarize it', defaultSiteTemplates)).toMatchObject({
      intent: 'WEB_SEARCH_THEN_SUMMARIZE',
      query: 'stellar soroban docs'
    });
  });

  it('parses open web search', () => {
    expect(parseCommand('look up how to deploy a smart contract on Stellar', defaultSiteTemplates)).toMatchObject({
      intent: 'WEB_SEARCH',
      query: 'how to deploy a smart contract on stellar'
    });
  });
});
