const { Summaries, BlogLinks, Website, Summaries_BlogLinks } = require('../models');

const createSummary = async (req, res) => {
    const { content, blogLinks, topic } = req.body;
    const { name } = req.user;
  
    console.log('Request body:', { content, blogLinks, topic });
    console.log('Authenticated user:', req.user);
  
    try {
      if (!content || content.trim() === '') {
        return res.status(400).json({ message: 'Content is required and cannot be empty' });
      }
      if (!blogLinks || !Array.isArray(blogLinks) || blogLinks.length === 0) {
        return res.status(400).json({ message: 'BlogLinks must be a non-empty array' });
      }
  
      for (const link of blogLinks) {
        if (!link.url || !link.websiteName) {
          return res.status(400).json({ message: 'Each blog link must have url and websiteName' });
        }
      }
  
      const summary = await Summaries.create({
        content,
        topic: topic || null,
        name,
        created_at: new Date(),
      });
  
      const createdBlogLinks = [];
  
      for (const { url, websiteName } of blogLinks) {
        let website = await Website.findOne({ where: { Name: websiteName } });
        if (!website) {
          website = await Website.create({
            Name: websiteName,
            URL: `https://${websiteName.toLowerCase().replace(/\s+/g, '')}.com`,
          });
        }
  
        let blogLink = await BlogLinks.findOne({ where: { URL: url } });
        if (!blogLink) {
          try {
            blogLink = await BlogLinks.create({
              URL: url,
              websiteID: website.websiteID,
            });
          } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
              return res.status(400).json({ message: `Blog link URL already exists: ${url}` });
            }
            throw error;
          }
        }
  
        await Summaries_BlogLinks.findOrCreate({
          where: {
            summary_id: summary.summary_id,
            BlogLinkID: blogLink.BlogLinkID,
          },
        });
  
        createdBlogLinks.push({ BlogLinkID: blogLink.BlogLinkID, URL: url, websiteName });
      }
  
      res.status(201).json({
        message: 'Summary and blog links created',
        summary_id: summary.summary_id,
        blogLinks: createdBlogLinks,
      });
    } catch (error) {
      console.error('Create summary error:', error);
      res.status(500).json({ message: 'Server error: ' + error.message });
    }
  };
const getUserSummaries = async (req, res) => {
    const { name } = req.user;
  
    try {
      const summaries = await Summaries.findAll({
        where: { name },
        include: [{
          model: BlogLinks,
          through: { attributes: [] }, // Exclude junction table attributes
          include: [{
            model: Website,
            attributes: ['Name'],
          }],
        }],
        order: [['created_at', 'DESC']],
      });
  
      const history = summaries.map(summary => ({
        id: summary.summary_id.toString(),
        topic: summary.topic || 'Unknown',
        website: summary.BlogLinks.map(bl => bl.Website.Name).join(','),
        summary: summary.content,
        sources: summary.BlogLinks.map(bl => ({
          url: bl.URL,
          website: bl.Website.Name,
        })),
        createdAt: summary.created_at.toISOString(),
      }));
  
      res.status(200).json(history);
    } catch (error) {
      console.error('Get summaries error:', error);
      res.status(500).json({ message: 'Server error: ' + error.message });
    }
  };
  // In summariesController.js

// In controllers/summariesController.js

const deleteSummary = async (req, res) => {
  const { summary_id } = req.params; // Get summary_id from URL parameters
  const { name } = req.user; // Get authenticated user's name

  try {
    // Find the summary by ID and ensure it belongs to the user
    const summary = await Summaries.findOne({
      where: {
        summary_id: summary_id,
        name: name,
      },
    });

    if (!summary) {
      return res.status(404).json({
        message: "Summary not found or you do not have permission to delete it.",
      });
    }

    // Find associated Summaries_BlogLinks entries
    const summaryBlogLinks = await Summaries_BlogLinks.findAll({
      where: {
        summary_id: summary_id,
      },
    });

    // Get the BlogLinkIDs associated with this summary
    const blogLinkIds = summaryBlogLinks.map((link) => link.BlogLinkID);

    // Delete associated records in Summaries_BlogLinks
    await Summaries_BlogLinks.destroy({
      where: {
        summary_id: summary_id,
      },
    });

    // Check and delete BlogLinks that are no longer referenced by any summary
    for (const blogLinkId of blogLinkIds) {
      const remainingLinks = await Summaries_BlogLinks.findOne({
        where: {
          BlogLinkID: blogLinkId,
        },
      });

      if (!remainingLinks) {
        // No other summaries reference this BlogLink, so delete it
        const blogLink = await BlogLinks.findOne({
          where: {
            BlogLinkID: blogLinkId,
          },
        });

        if (blogLink) {
          await BlogLinks.destroy({
            where: {
              BlogLinkID: blogLinkId,
            },
          });

          // Optionally, check if the associated Website is no longer referenced
          const remainingBlogLinksForWebsite = await BlogLinks.findOne({
            where: {
              websiteID: blogLink.websiteID,
            },
          });

          if (!remainingBlogLinksForWebsite) {
            // No other BlogLinks reference this Website, so delete it
            await Website.destroy({
              where: {
                websiteID: blogLink.websiteID,
              },
            });
          }
        }
      }
    }

    // Delete the summary
    await Summaries.destroy({
      where: {
        summary_id: summary_id,
      },
    });

    res.status(200).json({
      message: "Summary, associated blog links, and unreferenced websites deleted successfully",
      summary_id: summary_id,
    });
  } catch (error) {
    console.error("Delete summary error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Export the new function along with existing ones
module.exports = { createSummary, getUserSummaries, deleteSummary };

