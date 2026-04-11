import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Media Converter Web App', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the initialization to complete
    await expect(page.locator('text=Initializing Converter Engine...')).toBeHidden({ timeout: 15000 });
  });

  test('should display the correct title and initial UI', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Batch Media Converter' })).toBeVisible();
    await expect(page.locator('text=Drag & drop your files here')).toBeVisible();
    await expect(page.getByRole('button', { name: /Convert 0 Files/i })).toBeDisabled();
  });

  test('should allow changing the output format', async ({ page }) => {
    const formatSelect = page.locator('select');
    await expect(formatSelect).toHaveValue('mp4');
    
    await formatSelect.selectOption('webp');
    await expect(formatSelect).toHaveValue('webp');
  });

  test('should upload files and display them in the list', async ({ page }) => {
    // Add file directly to the input
    await page.locator('input[type="file"]').setInputFiles([
      path.join(__dirname, 'fixtures/test-image.png'),
      path.join(__dirname, 'fixtures/test-video.mp4')
    ]);

    // Check if files are listed
    await expect(page.locator('text=test-image.png')).toBeVisible();
    await expect(page.locator('text=test-video.mp4')).toBeVisible();

    // Check if convert button updated
    await expect(page.getByRole('button', { name: 'Convert 2 Files' })).toBeEnabled();
  });

  test('should allow removing a file from the list', async ({ page }) => {
    // Add file
    await page.locator('input[type="file"]').setInputFiles([
      path.join(__dirname, 'fixtures/test-image.png'),
      path.join(__dirname, 'fixtures/test-video.mp4')
    ]);

    // Check if files are listed
    await expect(page.locator('text=test-image.png')).toBeVisible();

    // Remove the first file
    const removeButtons = page.getByRole('button', { name: 'Remove file' });
    await expect(removeButtons).toHaveCount(2);
    
    await removeButtons.first().click();

    // Should only have 1 file now
    await expect(page.locator('text=test-image.png')).toBeHidden();
    await expect(page.locator('text=test-video.mp4')).toBeVisible();
    await expect(removeButtons).toHaveCount(1);
    
    // Check if convert button updated
    await expect(page.getByRole('button', { name: 'Convert 1 File' })).toBeEnabled();
  });

  test('should toggle dark/light mode', async ({ page }) => {
    const themeToggle = page.getByLabel('Toggle Dark Mode');
    await expect(themeToggle).toBeVisible();
    
    await themeToggle.click();
    await themeToggle.click();
    await expect(page.getByRole('heading', { name: 'Batch Media Converter' })).toBeVisible();
  });

  test('should successfully convert a real file', async ({ page }) => {
    test.setTimeout(60000); // 60s timeout for FFmpeg to load and convert

    // Add the real test image
    await page.locator('input[type="file"]').setInputFiles([
      path.join(__dirname, 'fixtures/real-test.png')
    ]);

    // Check if file is listed
    await expect(page.locator('text=real-test.png')).toBeVisible();

    // Select output format (e.g., webp)
    const formatSelect = page.locator('select');
    await formatSelect.selectOption('webp');

    // Click Convert
    const convertBtn = page.getByRole('button', { name: 'Convert 1 File' });
    await expect(convertBtn).toBeEnabled();
    await convertBtn.click();

    // Ensure it transitions to Converting state
    await expect(page.getByRole('button', { name: /Converting/i })).toBeVisible();

    // Wait for the download link to appear indicating success
    const downloadLink = page.locator('a', { hasText: 'Download' });
    await expect(downloadLink).toBeVisible({ timeout: 45000 });
    
    // Ensure the main button transitions to All Done!
    await expect(page.getByRole('button', { name: /All Done!/i })).toBeVisible();
  });

  test('should successfully convert a real video file', async ({ page }) => {
    test.setTimeout(120000); // 120s timeout for video conversion

    // Add the real test video
    await page.locator('input[type="file"]').setInputFiles([
      path.join(__dirname, 'fixtures/real-test.mp4')
    ]);

    // Check if file is listed
    await expect(page.locator('text=real-test.mp4')).toBeVisible();

    // Select output format
    const formatSelect = page.locator('select');
    await formatSelect.selectOption('gif');

    // Click Convert
    const convertBtn = page.getByRole('button', { name: 'Convert 1 File' });
    await expect(convertBtn).toBeEnabled();
    await convertBtn.click();

    // Ensure it transitions to Converting state
    await expect(page.getByRole('button', { name: /Converting/i })).toBeVisible();

    // Wait for the download link to appear indicating success
    const downloadLink = page.locator('a', { hasText: 'Download' });
    await expect(downloadLink).toBeVisible({ timeout: 100000 });
    
    // Ensure the main button transitions to All Done!
    await expect(page.getByRole('button', { name: /All Done!/i })).toBeVisible();
  });

});