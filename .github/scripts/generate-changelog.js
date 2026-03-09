#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Generate CHANGELOG.md following Keep a Changelog format
 * https://keepachangelog.com/
 */

const CHANGELOG_PATH = path.join(process.cwd(), 'CHANGELOG.md');

// Category mappings from conventional commit types
const TYPE_CATEGORIES = {
  feat: 'Added',
  add: 'Added',
  fix: 'Fixed',
  bugfix: 'Fixed',
  docs: 'Documentation',
  doc: 'Documentation',
  style: 'Changed',
  refactor: 'Changed',
  perf: 'Changed',
  test: 'Added',
  build: 'Changed',
  ci: 'Changed',
  chore: 'Changed',
  revert: 'Removed',
  remove: 'Removed',
  deprecate: 'Deprecated',
  security: 'Security',
  deps: 'Security',
};

/**
 * Get all tags sorted by version
 */
function getTags() {
  try {
    const tags = execSync('git tag --sort=-version:refname', { encoding: 'utf-8' })
      .trim()
      .split('\n')
      .filter(Boolean);
    return tags;
  } catch {
    return [];
  }
}

/**
 * Get commits between two refs
 */
function getCommits(from, to = 'HEAD') {
  try {
    const range = from ? `${from}..${to}` : to;
    const log = execSync(
      `git log ${range} --pretty=format:"%H|%s|%an|%ad" --date=short`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );
    
    return log.trim().split('\n').filter(Boolean).map(line => {
      const [hash, subject, author, date] = line.split('|');
      return { hash, subject, author, date };
    });
  } catch {
    return [];
  }
}

/**
 * Parse conventional commit message
 */
function parseCommit(subject) {
  // Match: type(scope): description or type: description
  const match = subject.match(/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|security|add|remove|deprecate|bugfix|doc|deps)(\([^)]+\))?:\s*(.+)$/i);
  
  if (match) {
    const type = match[1].toLowerCase();
    const scope = match[2] ? match[2].slice(1, -1) : null;
    const description = match[3];
    const category = TYPE_CATEGORIES[type] || 'Changed';
    
    return { type, scope, description, category };
  }
  
  // Non-conventional commit
  return { type: null, scope: null, description: subject, category: 'Changed' };
}

/**
 * Group commits by category
 */
function groupByCategory(commits) {
  const groups = {};
  
  for (const commit of commits) {
    const parsed = parseCommit(commit.subject);
    const category = parsed.category;
    
    if (!groups[category]) {
      groups[category] = [];
    }
    
    groups[category].push({
      ...commit,
      ...parsed,
    });
  }
  
  return groups;
}

/**
 * Format category section
 */
function formatCategory(category, commits) {
  const lines = [`### ${category}`];
  
  for (const commit of commits) {
    const scope = commit.scope ? `**${commit.scope}**: ` : '';
    const item = `- ${scope}${commit.description}`;
    lines.push(item);
  }
  
  return lines.join('\n');
}

/**
 * Get version from package.json
 */
function getVersion() {
  try {
    const pkg = require(path.join(process.cwd(), 'package.json'));
    return pkg.version || 'Unreleased';
  } catch {
    return 'Unreleased';
  }
}

/**
 * Format date
 */
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Generate changelog content for a version
 */
function generateVersionSection(version, commits, previousVersion = null) {
  const today = formatDate(new Date());
  const lines = [];
  
  lines.push(`## [${version}] - ${today}`);
  lines.push('');
  
  const groups = groupByCategory(commits);
  
  // Order categories
  const categoryOrder = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security', 'Documentation'];
  
  for (const category of categoryOrder) {
    if (groups[category] && groups[category].length > 0) {
      lines.push(formatCategory(category, groups[category]));
      lines.push('');
    }
  }
  
  // Any remaining categories
  for (const [category, categoryCommits] of Object.entries(groups)) {
    if (!categoryOrder.includes(category) && categoryCommits.length > 0) {
      lines.push(formatCategory(category, categoryCommits));
      lines.push('');
    }
  }
  
  return lines.join('\n');
}

/**
 * Read existing changelog
 */
function readExistingChangelog() {
  if (fs.existsSync(CHANGELOG_PATH)) {
    return fs.readFileSync(CHANGELOG_PATH, 'utf-8');
  }
  return null;
}

/**
 * Extract existing sections from changelog
 */
function extractExistingSections(content) {
  // Find where version sections start
  const versionRegex = /^## \[.*?\] - \d{4}-\d{2}-\d{2}/m;
  const match = content.match(versionRegex);
  
  if (match) {
    return {
      header: content.substring(0, match.index).trim(),
      versions: content.substring(match.index),
    };
  }
  
  return { header: content, versions: '' };
}

/**
 * Main function
 */
function main() {
  console.log('🔄 Generating CHANGELOG.md...');
  
  const version = getVersion();
  const tags = getTags();
  
  // Get commits since last tag (or all commits if no tags)
  const lastTag = tags[0];
  const commits = getCommits(lastTag);
  
  if (commits.length === 0) {
    console.log('ℹ️  No new commits to add to changelog');
    return;
  }
  
  console.log(`📝 Found ${commits.length} new commits`);
  
  // Read existing changelog
  const existingContent = readExistingChangelog();
  const { header, versions } = extractExistingSections(existingContent || '');
  
  // Generate new version section
  const newSection = generateVersionSection(version, commits);
  
  // Check if we need to update existing version or add new one
  let updatedVersions;
  const existingVersionMatch = versions.match(new RegExp(`^## \\[${version.replace(/\./g, '\\.')}\\]`, 'm'));
  
  if (existingVersionMatch) {
    // Update existing version section
    const nextVersionMatch = versions.indexOf('\n## [', existingVersionMatch.index + 1);
    const beforeVersion = versions.substring(0, existingVersionMatch.index);
    const afterVersion = nextVersionMatch > 0 ? versions.substring(nextVersionMatch) : '';
    updatedVersions = beforeVersion + newSection + '\n' + afterVersion;
    console.log(`📝 Updating existing section for version ${version}`);
  } else {
    // Add new version section
    updatedVersions = newSection + '\n' + versions;
    console.log(`✨ Adding new section for version ${version}`);
  }
  
  // Build final changelog
  const changelog = `${header}

${updatedVersions}
`;
  
  // Write changelog
  fs.writeFileSync(CHANGELOG_PATH, changelog.trim() + '\n');
  console.log('✅ CHANGELOG.md updated successfully!');
}

main();
