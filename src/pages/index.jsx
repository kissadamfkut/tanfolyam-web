import flatten from 'lodash.flatten';
import PropTypes from 'prop-types';
import React from 'react';
import { css } from 'react-emotion';
import Helmet from 'react-helmet';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import Container from '../components/Container';
import MultipleChoiceInputGroup from '../components/MultipleChoiceInputGroup';
import RadioButton from '../components/RadioButton';
import { mediaQueries } from '../utils/media-queries';

class CoursesPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerms: [],
    };

    this.handleSearchTermsChange = this.handleSearchTermsChange.bind(this);

    const { data } = props;

    this.allTags = Array.from(data.courses.edges.reduce((accumulator, { node }) => {
      // Count the global occurrence of each tag
      node.frontmatter.tags.forEach((tag) => {
        accumulator.set(tag, (accumulator.get(tag) || 0) + 1);
      });
      return accumulator;
    }, new Map()))
      .sort(([tag1, occurrenceCount1], [tag2, occurrenceCount2]) =>
        // Sort tags by occurrence count (descending) and then by name (ascending)
        (occurrenceCount1 !== occurrenceCount2
          ? occurrenceCount2 - occurrenceCount1
          : tag1.localeCompare(tag2)))
      .map(([tag]) =>
        // Drop occurrence counts
        tag);
  }

  handleSearchTermsChange(value) {
    this.setState({
      searchTerms: value,
    });
  }

  render() {
    const { data } = this.props;
    const { allTags } = this;
    const { searchTerms } = this.state;

    const searchTermValues = searchTerms.map(({ value }) => value);

    return (
      <Container>
        <Helmet title="Tanfolyamok" />

        <div
          className={css`
            ${mediaQueries.large(css`
              display: flex;
              margin: -2rem;

              > * {
                flex: 50%;
                padding: 2rem;
              }
            `)};
          `}
        >
          <div>
            <h2>
              <span role="img" aria-label="egy halom könyv">
                📚
              </span>{' '}
              Tanfolyamainkról
            </h2>

            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur.
            </p>
          </div>

          <div>
            <h2>
              <span role="img" aria-label="nagyítóüveg">
                🔍
              </span>{' '}
              Keresés a tanfolyamok között
            </h2>

            <form
              className={css`
                label {
                  display: inline-block;
                  margin-right: 1em;

                  input[type='checkbox'],
                  input[type='radio'] {
                    margin-right: 0.42em;
                  }
                }
              `}
            >
              <fieldset>
                <legend>Milyen szakra jársz?</legend>

                <MultipleChoiceInputGroup name="programme">
                  <RadioButton
                    value="computerEngineering"
                    label="Mérnökinformatikus"
                  />
                  <RadioButton
                    value="electricalEngineering"
                    label="Villamosmérnök"
                  />
                  <RadioButton value="other" label="Egyéb" />
                </MultipleChoiceInputGroup>
              </fieldset>

              <fieldset>
                <legend>Melyik évben kezdtél?</legend>

                <MultipleChoiceInputGroup name="startYear">
                  <RadioButton value="2017" />
                  <RadioButton value="2016" />
                  <RadioButton value="2015" />
                  <RadioButton value="other" label="Egyéb" />
                </MultipleChoiceInputGroup>
              </fieldset>

              <fieldset>
                <legend>Milyen témakörök iránt érdeklődsz?</legend>

                <Select
                  multi
                  options={allTags.map(tag => ({ value: tag, label: tag }))}
                  value={searchTerms}
                  onChange={this.handleSearchTermsChange}
                />
              </fieldset>
            </form>
          </div>
        </div>

        <div>
          {data.courses.edges
            .filter(({ node }) =>
              // Show every course which has at least one of the desired tags
              // TODO: Sort results by relevance
              node.frontmatter.tags.some(tag => searchTermValues.includes(tag)))
            .map(({ node }) => {
              // TODO: Add support for missing startDate/endDate
              const dates = node.frontmatter.occasions.map(occasion => `${occasion.startDate} – ${occasion.endDate}`);

              const allInstructors = Array.from(new Set(flatten(node.frontmatter.occasions
                      .map(occasion => occasion.instructors)
                      .filter(instructors => instructors != null))));

              return (
                <article
                  key={`${node.frontmatter.society.id}__${
                    node.frontmatter.title
                  }`}
                >
                  <div
                    className={css`
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                    `}
                  >
                    <div>
                      <h3>{node.frontmatter.title}</h3>

                      <ul
                        className={css`
                          position: relative;
                          list-style: none;
                          padding-left: 1.75em;
                          line-height: 1.5;

                          li::before {
                            position: absolute;
                            left: 0;
                          }
                        `}
                      >
                        {dates.length > 0 && (
                          <li
                            className={css`
                              ::before {
                                content: '🕓';
                              }
                            `}
                          >
                            <span
                              aria-label={`${
                                dates.length === 1 ? 'Időpont' : 'Időpontok'
                              }: `}
                            />
                            {dates.join(', ')}
                          </li>
                        )}

                        {allInstructors.length > 0 && (
                          <li
                            className={css`
                              ::before {
                                content: '🎓';
                              }
                            `}
                          >
                            <span
                              aria-label={`${
                                allInstructors.length === 1
                                  ? 'Oktató'
                                  : 'Oktatók'
                              }: `}
                            />
                            {allInstructors.join(', ')}
                          </li>
                        )}

                        {node.frontmatter.society.website != null && (
                          <li
                            className={css`
                              ::before {
                                content: '🌐';
                              }
                            `}
                          >
                            <span aria-label="A kör weboldala: " />
                            <a
                              href={node.frontmatter.society.website}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {/* Show the URL without protocol */}
                              {node.frontmatter.society.website.replace(
                                /(^\w+:|^)\/\//,
                                '',
                              )}
                            </a>
                          </li>
                        )}
                      </ul>
                    </div>

                    <img
                      src={node.frontmatter.society.logo.publicURL}
                      alt={`${node.frontmatter.society.id} logó`}
                      className={css`
                        width: 4em;
                        margin-left: 2rem;
                      `}
                    />
                  </div>

                  <div
                    className={css`
                      > :first-child {
                        margin-top: 0;
                      }

                      > :last-child {
                        margin-bottom: 0;
                      }
                    `}
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: node.html }}
                  />
                  <div
                    className={css`
                      display: flex;
                      justify-content: flex-end;
                    `}
                  >
                    <a
                      href={node.frontmatter.applicationFormURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      role="button"
                      className={css`
                        display: inline-block;
                        border: 0.2rem black solid;
                        padding: 0.8em;
                        text-align: center;
                        color: inherit;
                        font-weight: bold;
                        text-decoration: none;

                        & :hover {
                          text-decoration: none;
                        }
                      `}
                    >
                      Jelentkezés
                    </a>
                  </div>
                </article>
              );
            })}
        </div>
      </Container>
    );
  }
}

CoursesPage.propTypes = {
  data: PropTypes.shape({}).isRequired,
};

export default CoursesPage;

export const query = graphql`
  query CoursesPageQuery {
    courses: allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/courses/" } }
    ) {
      edges {
        node {
          frontmatter {
            title
            society {
              id
              logo {
                publicURL
              }
              website
            }
            occasions {
              startDate(formatString: "MMMM Do LT", locale: "hu")
              endDate(formatString: "LT", locale: "hu")
              location
              instructors
            }
            moreInfoURL
            applicationFormURL
            tags
          }
          html
        }
      }
    }
  }
`;
